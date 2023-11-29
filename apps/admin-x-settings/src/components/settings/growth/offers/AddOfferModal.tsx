import PortalFrame from '../../membership/portal/PortalFrame';
import useFeatureFlag from '../../../../hooks/useFeatureFlag';
import {ErrorMessages, useForm} from '@tryghost/admin-x-framework/hooks';
import {Form, Icon, PreviewModalContent, Select, SelectOption, TextArea, TextField, showToast} from '@tryghost/admin-x-design-system';
import {getOfferPortalPreviewUrl, offerPortalPreviewUrlTypes} from '../../../../utils/getOffersPortalPreviewUrl';
import {getPaidActiveTiers, useBrowseTiers} from '@tryghost/admin-x-framework/api/tiers';
import {getTiersCadences} from '../../../../utils/getTiersCadences';
import {useAddOffer} from '@tryghost/admin-x-framework/api/offers';
import {useEffect, useMemo, useState} from 'react';
import {useGlobalData} from '../../../providers/GlobalDataProvider';
import {useModal} from '@ebay/nice-modal-react';
import {useRouting} from '@tryghost/admin-x-framework/routing';

// we should replace this with a library
function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

interface OfferType {
    title: string;
    description: string;
}

const ButtonSelect: React.FC<{type: OfferType, checked: boolean, onClick: () => void}> = ({type, checked, onClick}) => {
    const checkboxClass = checked ? 'bg-black text-white' : 'border border-grey-300';

    return (
        <button className='text-left' type='button' onClick={onClick}>
            <div className='flex gap-3'>
                <div className={`mt-0.5 flex h-4 w-4 items-center justify-center rounded-full ${checkboxClass}`}>
                    {checked ? <Icon className='w-[7px] stroke-[4]' name='check' size='custom' /> : null}
                </div>
                <div className='flex flex-col'>
                    <span>{type.title}</span>
                    <span className='text-sm'>{type.description}</span>
                </div>
            </div>
        </button>
    );
};

type formStateTypes = {
    disableBackground?: boolean;
    name: string;
    code: {
        isDirty: boolean;
        value: string;
    };
    displayTitle: {
        isDirty: boolean;
        value: string;
    };
    displayDescription: string;
    type: string;
    cadence: string;
    amount: number;
    duration: string;
    durationInMonths: number;
    currency: string;
    status: string;
    tierId: string;
    fixedAmount?: number;
    trialAmount?: number;
    percentAmount?: number;
};

const calculateAmount = (formState: formStateTypes): number => {
    const {fixedAmount = 0, percentAmount = 0, trialAmount = 0, amount = 0} = formState;

    switch (formState.type) {
    case 'fixed':
        return fixedAmount * 100;
    case 'percent':
        return percentAmount;
    case 'trial':
        return trialAmount;
    default:
        return amount;
    }
};

type SidebarProps = {
    tierOptions: SelectOption[];
    handleTierChange: (tier: SelectOption) => void;
    selectedTier: SelectOption;
    overrides: formStateTypes;
    // handleTextInput: (e: React.ChangeEvent<HTMLInputElement>, key: keyof offerPortalPreviewUrlTypes) => void;
    amountOptions: SelectOption[];
    typeOptions: OfferType[];
    durationOptions: SelectOption[];
    handleTypeChange: (type: string) => void;
    handleDurationChange: (duration: string) => void;
    handleAmountTypeChange: (amountType: string) => void;
    handleNameInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleTextAreaInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleDisplayTitleInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleAmountInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDurationInMonthsInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleCodeInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
    validate: () => void;
    clearError: (field: string) => void;
    testId: string;
    errors: ErrorMessages;
    handleTrialAmountInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const Sidebar: React.FC<SidebarProps> = ({tierOptions,
    handleTierChange,
    selectedTier,
    // handleTextInput,
    typeOptions,
    durationOptions,
    handleTypeChange,
    handleDurationChange,
    overrides,
    handleAmountTypeChange,
    handleNameInput,
    handleTextAreaInput,
    handleDisplayTitleInput,
    handleDurationInMonthsInput,
    handleAmountInput,
    handleCodeInput,
    validate,
    errors,
    testId,
    handleTrialAmountInput,
    amountOptions}) => {
    // const handleError = useHandleError();
    const getFilteredDurationOptions = () => {
        // Check if the selected tier's cadence is 'yearly'
        if (selectedTier?.label?.includes('Yearly')) {
            // Filter out 'repeating' from duration options
            return durationOptions.filter(option => option.value !== 'repeating');
        }
        return durationOptions;
    };
    const filteredDurationOptions = getFilteredDurationOptions();

    const [nameLength, setNameLength] = useState(0);
    const nameLengthColor = nameLength > 40 ? 'text-red' : 'text-green';

    return (
        <div className='pt-7' data-testId={testId}>
            <Form>
                <TextField
                    error={Boolean(errors.name)}
                    hint={errors.name || <div className='flex justify-between'><span>Visible to members on Stripe Checkout page</span><strong><span className={`${nameLengthColor}`}>{nameLength}</span> / 40</strong></div>}
                    maxLength={40}
                    placeholder='Black Friday'
                    title='Name'
                    onBlur={validate}
                    onChange={(e) => {
                        handleNameInput(e);
                        setNameLength(e.target.value.length);
                    }}
                />
                <section className='mt-4'>
                    <h2 className='mb-4 text-lg'>Offer details</h2>
                    <div className='flex flex-col gap-6'>
                        <div className='flex flex-col gap-4 rounded-md border border-grey-200 p-4'>
                            <ButtonSelect checked={overrides.type !== 'trial' ? true : false} type={typeOptions[0]} onClick={() => {
                                handleTypeChange('percent');
                            }} />
                            <ButtonSelect checked={overrides.type === 'trial' ? true : false} type={typeOptions[1]} onClick={() => {
                                handleTypeChange('trial');
                            }} />
                        </div>
                        <Select
                            options={tierOptions}
                            selectedOption={selectedTier}
                            title='Tier — Cadence'
                            onSelect={(e) => {
                                if (e) {
                                    handleTierChange(e);
                                }
                            }}
                        />
                        {
                            overrides.type !== 'trial' && <> <div className='relative'>
                                <TextField
                                    error={Boolean(errors.amount)}
                                    hint={errors.amount}
                                    title='Amount off'
                                    type='number' 
                                    value={
                                        overrides.type === 'fixed' 
                                            ? (overrides.fixedAmount === 0 ? '' : overrides.fixedAmount?.toString()) 
                                            : (overrides.percentAmount === 0 ? '' : overrides.percentAmount?.toString())
                                    }
                                    onBlur={validate} 
                                    onChange={(e) => {
                                        handleAmountInput(e);
                                    }}
                                />
                                <div className='absolute bottom-0 right-1.5 z-10'>
                                    <Select
                                        clearBg={true}
                                        controlClasses={{menu: 'w-20 right-0'}}
                                        options={amountOptions}
                                        selectedOption={overrides.type === 'percent' ? amountOptions[0] : amountOptions[1]}
                                        onSelect={(e) => {
                                            handleAmountTypeChange(e?.value || '');
                                        }}
                                    />
                                </div>
                            </div>
                            <Select
                                options={filteredDurationOptions}
                                selectedOption={filteredDurationOptions.find(option => option.value === overrides.duration)}
                                title='Duration'
                                onSelect={e => handleDurationChange(e?.value || '')}
                            />

                            {
                                overrides.duration === 'repeating' && <TextField title='Duration in months' type='number' onChange={(e) => {
                                    handleDurationInMonthsInput(e);
                                }} />
                            }
                            </>
                        }

                        {
                            overrides.type === 'trial' && <TextField
                                error={Boolean(errors.amount)}
                                hint={errors.amount}
                                title='Trial duration'
                                type='number'
                                value={overrides.trialAmount?.toString()}
                                onBlur={validate}
                                onChange={(e) => {
                                    handleTrialAmountInput(e);
                                }} />
                        }

                    </div>
                </section>
                <section className='mt-4'>
                    <h2 className='mb-4 text-lg'>Portal Settings</h2>
                    <div className='flex flex-col gap-6'>
                        <TextField
                            error={Boolean(errors.displayTitle)}
                            hint={errors.displayTitle}
                            placeholder='Black Friday Special'
                            title='Display title'
                            value={overrides.displayTitle.value}
                            onBlur={validate}
                            onChange={(e) => {
                                handleDisplayTitleInput(e);
                            }}
                        />
                        <TextField
                            error={Boolean(errors.code)}
                            hint={errors.code}
                            placeholder='black-friday'
                            title='Offer code'
                            value={overrides.code.value}
                            onBlur={validate}
                            onChange={(e) => {
                                handleCodeInput(e);
                            }}
                        />
                        <TextArea
                            placeholder='Take advantage of this limited-time offer.'
                            title='Display description'
                            value={overrides.displayDescription}
                            onChange={(e) => {
                                handleTextAreaInput(e);
                            }}
                        />
                    </div>
                </section>
            </Form>
        </div>
    );
};

const parseData = (input: string): { id: string; period: string; currency: string } => {
    const [id, period, currency] = input.split('-');
    if (!id || !period || !currency) {
        throw new Error('Invalid input format. Expected format is: id-period-currency');
    }
    return {id, period, currency};
};

const AddOfferModal = () => {
    const {siteData} = useGlobalData();
    const typeOptions = [
        {title: 'Discount', description: 'Offer a special reduced price', value: 'percent'},
        {title: 'Free trial', description: 'Give free access for a limited time', value: 'trial'}
    ];

    const durationOptions = [
        {value: 'once', label: 'First-payment'},
        {value: 'repeating', label: 'Multiple-months'},
        {value: 'forever', label: 'Forever'}
    ];

    const [href, setHref] = useState<string>('');
    const modal = useModal();
    const {updateRoute} = useRouting();
    const hasOffers = useFeatureFlag('adminXOffers');
    const {data: {tiers} = {}} = useBrowseTiers();
    const activeTiers = getPaidActiveTiers(tiers || []);
    const tierCadenceOptions = getTiersCadences(activeTiers);
    const {mutateAsync: addOffer} = useAddOffer();
    const [selectedTier, setSelectedTier] = useState({
        tier: tierCadenceOptions[0] || {},
        dataset: {
            id: tierCadenceOptions[0]?.value ? parseData(tierCadenceOptions[0]?.value).id : '',
            period: tierCadenceOptions[0]?.value ? parseData(tierCadenceOptions[0]?.value).period : '',
            currency: tierCadenceOptions[0]?.value ? parseData(tierCadenceOptions[0]?.value).currency : ''
        }
    });

    const {formState, updateForm, handleSave, saveState, okProps, validate, errors, clearError} = useForm({
        initialState: {
            disableBackground: false,
            name: '',
            code: {
                isDirty: false,
                value: ''
            },
            displayTitle: {
                isDirty: false,
                value: ''
            },
            displayDescription: '',
            type: 'percent',
            cadence: selectedTier?.dataset?.period || '',
            amount: 0,
            duration: 'once',
            durationInMonths: 0,
            currency: selectedTier?.dataset?.currency || 'USD',
            status: 'active',
            tierId: selectedTier?.dataset?.id || '',
            trialAmount: 7,
            fixedAmount: 0,
            percentAmount: 0
        },
        onSave: async () => {
            const dataset = {
                name: formState.name,
                code: formState.code.value,
                display_title: formState.displayTitle.value,
                display_description: formState.displayDescription,
                cadence: formState.cadence,
                amount: calculateAmount(formState) || 0,
                duration: formState.type === 'trial' ? 'trial' : formState.duration,
                duration_in_months: Number(formState.durationInMonths),
                currency: formState.currency,
                status: formState.status,
                tier: {
                    id: formState.tierId
                },
                type: formState.type,
                currency_restriction: false
            };

            const response = await addOffer(dataset);

            if (response && response.offers && response.offers.length > 0) {
                updateRoute(`offers/success/${response.offers[0].id}`);
            }
        },
        onSaveError: () => {},
        onValidate: () => {
            const newErrors : Record<string, string> = {};

            if (!formState.name && formState.name.length === 0) {
                newErrors.name = 'Name is required';
            }

            if (!formState.code.value && formState.code.value.length === 0) {
                newErrors.code = 'Code is required';
            }

            if (!formState.displayTitle.value && formState.displayTitle.value.length === 0) {
                newErrors.displayTitle = 'Display title is required';
            }

            if (formState.type === 'percent' && formState.percentAmount === 0) {
                newErrors.amount = 'Enter an amount greater than 0.';
            }

            if (formState.type === 'percent' && (formState.percentAmount < 0 || formState.percentAmount >= 100)) {
                newErrors.amount = 'Amount must be between 0 and 100%.';
            }

            if (formState.type === 'fixed' && formState.fixedAmount === 0 || formState.type === 'fixed' && formState.fixedAmount < 1) {
                newErrors.amount = 'Enter an amount greater than 0.';
            }

            if (formState.type === 'trial' && formState.trialAmount === 0) {
                newErrors.amount = 'Enter an amount greater than 0.';
            }

            if (formState.type === 'trial' && formState.trialAmount < 1) {
                newErrors.amount = 'Free trial must be at least 1 day.';
            }

            return newErrors;
        },
        savingDelay: 500
    });

    const amountOptions = [
        {value: 'percent', label: '%'},
        {value: 'fixed', label: formState.currency}
    ];

    const handleTierChange = (tier: SelectOption) => {
        setSelectedTier({
            tier,
            dataset: parseData(tier.value)
        });
        updateForm(state => ({
            ...state,
            cadence: parseData(tier.value).period,
            currency: parseData(tier.value).currency,
            tierId: parseData(tier.value).id
        }));
    };

    const handleTypeChange = (type: string) => {
        updateForm(state => ({
            ...state,
            type: type
        }));
    };

    const handleAmountTypeChange = (amountType: string) => {
        updateForm(state => ({
            ...state,
            type: amountType === 'percent' ? 'percent' : 'fixed' || state.type
        }));
    };

    const handleAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;

        if (formState.type === 'fixed') {
            updateForm(state => ({
                ...state,
                fixedAmount: Number(target.value)
            }));
        } else if (formState.type === 'percent') {
            updateForm(state => ({
                ...state,
                percentAmount: Number(target.value)
            }));
        } else {
            updateForm(state => ({
                ...state,
                amount: Number(target.value)
            }));
        }
    };

    const handleDurationInMonthsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        updateForm(state => ({
            ...state,
            durationInMonths: Number(target.value)
        }));
    };

    const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        updateForm((prevOverrides) => {
            let newOverrides = {...prevOverrides};
            newOverrides.name = newValue;
            if (!prevOverrides.code.isDirty) {
                newOverrides.code = {
                    ...prevOverrides.code,
                    value: slugify(newValue)
                };
            }
            if (!prevOverrides.displayTitle.isDirty) {
                newOverrides.displayTitle = {
                    ...prevOverrides.displayTitle,
                    value: newValue
                };
            }
            return newOverrides;
        });
    };

    const handleDisplayTitleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        updateForm(state => ({
            ...state,
            displayTitle: {
                ...state.displayTitle,
                isDirty: true,
                value: target.value
            }
        }));
    };

    const handleTextAreaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const target = e.target as HTMLTextAreaElement;
        updateForm(state => ({
            ...state,
            displayDescription: target.value
        }));
    };

    const handleTrialAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        updateForm(state => ({
            ...state,
            trialAmount: Number(target.value)
        }));
    };

    const handleDurationChange = (duration: string) => {
        updateForm(state => ({
            ...state,
            duration: duration
        }));
    };

    const handleCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        updateForm(state => ({
            ...state,
            code: {
                ...state.code,
                isDirty: true,
                value: target.value
            }
        }));
    };

    useEffect(() => {
        if (!hasOffers) {
            modal.remove();
            updateRoute('');
        }
    }, [hasOffers, modal, updateRoute]);

    const cancelAddOffer = () => {
        updateRoute('offers/edit');
    };

    const overrides : offerPortalPreviewUrlTypes = useMemo(() => {
        return {
            name: formState.name || '',
            code: formState.code.value || '',
            displayTitle: formState.displayTitle.value || '',
            displayDescription: formState.displayDescription || '',
            type: formState.type || 'percent',
            cadence: formState.cadence || 'month',
            amount: calculateAmount(formState) || 0,
            duration: formState.type === 'trial' ? 'trial' : formState.duration || 'once',
            durationInMonths: formState.durationInMonths || 0,
            currency: formState.currency || 'USD',
            status: formState.status || 'active',
            tierId: formState.tierId || activeTiers[0]?.id
        };
    }, [formState, activeTiers]);

    useEffect(() => {
        const newHref = getOfferPortalPreviewUrl(overrides, siteData.url);
        setHref(newHref);
    }, [formState, siteData.url, formState.type, overrides]);

    const sidebar = <Sidebar
        amountOptions={amountOptions as SelectOption[]}
        clearError={clearError}
        durationOptions={durationOptions}
        errors={errors}
        handleAmountInput={handleAmountInput}
        handleAmountTypeChange={handleAmountTypeChange}
        handleCodeInput={handleCodeInput}
        handleDisplayTitleInput={handleDisplayTitleInput}
        handleDurationChange={handleDurationChange}
        handleDurationInMonthsInput={handleDurationInMonthsInput}
        handleNameInput={handleNameInput}
        handleTextAreaInput={handleTextAreaInput}
        handleTierChange={handleTierChange}
        handleTrialAmountInput={handleTrialAmountInput}
        handleTypeChange={handleTypeChange}
        overrides={formState}
        selectedTier={selectedTier.tier}
        testId='add-offer-sidebar'
        tierOptions={tierCadenceOptions}
        typeOptions={typeOptions}
        validate={validate}
    />;

    const iframe = <PortalFrame
        href={href}
    />;
    return <PreviewModalContent
        afterClose={() => {
            updateRoute('offers');
        }}
        cancelLabel='Cancel'
        deviceSelector={false}
        dirty={saveState === 'unsaved'}
        height='full'
        okColor={okProps.color}
        okLabel='Publish'
        preview={iframe}
        previewToolbarBreadcrumbs={[{label: 'Offers', onClick: () => {
            updateRoute('offers/edit');
        }}, {label: 'New offer'}]}
        sidebar={sidebar}
        size='lg'
        testId='add-offer-modal'
        title='Offer'
        onBreadcrumbsBack={() => {
            updateRoute('offers/edit');
        }}
        onCancel={cancelAddOffer}
        onOk={async () => {
            validate();
            const isErrorsEmpty = Object.keys(errors).length === 0;
            if (!isErrorsEmpty) {
                showToast({
                    type: 'pageError',
                    message: 'Can\'t save offer, please double check that you\'ve filled all mandatory fields correctly'
                });
                return;
            }
            if (!(await handleSave())) {
                showToast({
                    type: 'pageError',
                    message: 'Can\'t save offer, please double check that you\'ve filled all mandatory fields.'
                });
            }
        }}
    />;
};

export default AddOfferModal;