import React from 'react';
import TopLevelGroup from '../../TopLevelGroup';
import usePinturaEditor from '../../../hooks/usePinturaEditor';
import useSettingGroup from '../../../hooks/useSettingGroup';
import {APIError} from '@tryghost/admin-x-framework/errors';
import {ImageUpload, SettingGroupContent, TextField, withErrorBoundary} from '@tryghost/admin-x-design-system';
import {getImageUrl, useUploadImage} from '@tryghost/admin-x-framework/api/images';
import {getSettingValues} from '@tryghost/admin-x-framework/api/settings';
import {useHandleError} from '@tryghost/admin-x-framework/hooks';

const WebsiteLogo: React.FC<{ keywords: string[] }> = ({keywords}) => {
    const {
        localSettings,
        isEditing,
        saveState,
        focusRef,
        handleSave,
        handleCancel,
        updateSetting,
        handleEditingChange
    } = useSettingGroup();

    const {mutateAsync: uploadImage} = useUploadImage();
    // const [unsplashEnabled] = getSettingValues<boolean>(localSettings, ['unsplash']);
    // const [showUnsplash, setShowUnsplash] = useState<boolean>(false);
    const handleError = useHandleError();

    const editor = usePinturaEditor();

    const [
        logo
    ] = getSettingValues(localSettings, ['logo']) as string[];

    const handleImageUpload = async (file: File) => {
        try {
            const imageUrl = getImageUrl(await uploadImage({file}));
            updateSetting('logo', imageUrl);
        } catch (e) {
            const error = e as APIError;
            if (error.response!.status === 415) {
                error.message = 'Unsupported file type';
            }
            handleError(error);
            //manifest update. 
        }
    };

    const handleImageDelete = () => {
        updateSetting('logo', '');
    };

    const values = (
        <></>
    );

    const inputFields = (
        <div className="md:mx-[52px]">
            <div>
                <div className="mb-2 h-3 w-full rounded bg-grey-200 dark:bg-grey-900"></div>
                <div className="mb-4 h-3 w-3/5 rounded bg-grey-200 dark:bg-grey-900"></div>
                <SettingGroupContent className="overflow-hidden rounded-md border border-grey-300 dark:border-grey-900">
                    <ImageUpload
                        fileUploadClassName='flex cursor-pointer items-center justify-center rounded rounded-b-none border border-grey-100 border-b-0 bg-grey-75 p-3 text-sm font-semibold text-grey-800 hover:text-black dark:border-grey-900'
                        height='300px'
                        id='facebook-image'
                        imageURL={logo}
                        pintura={
                            {
                                isEnabled: editor.isEnabled,
                                openEditor: async () => editor.openEditor({
                                    image: logo || '',
                                    handleSave: async (file:File) => {
                                        const imageUrl = getImageUrl(await uploadImage({file}));
                                        updateSetting('logo', imageUrl);
                                    }
                                })
                            }
                        }
                        onDelete={handleImageDelete}
                        onUpload={handleImageUpload}
                    >
                        Upload Website Logo
                    </ImageUpload>
                </SettingGroupContent>
            </div>
        </div>
    );

    return (
        <TopLevelGroup
            // description='Customize structured data of your site'
            isEditing={isEditing}
            keywords={keywords}
            navid='logo'
            saveState={saveState}
            testId='logo'
            title='Website Logo'
            onCancel={handleCancel}
            onEditingChange={handleEditingChange}
            onSave={handleSave}
        >
            {values}
            {isEditing ? inputFields : null}
        </TopLevelGroup>
    );
};

export default withErrorBoundary(WebsiteLogo, 'Website Logo');
