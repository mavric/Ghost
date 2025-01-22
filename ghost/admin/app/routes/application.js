import * as Sentry from '@sentry/ember';
import AdminXSettings from '../components/admin-x/settings';
import AuthConfiguration from 'ember-simple-auth/configuration';
import React from 'react';
import ReactDOM from 'react-dom';
import Route from '@ember/routing/route';
import ShortcutsRoute from 'ghost-admin/mixins/shortcuts-route';
import ctrlOrCmd from 'ghost-admin/utils/ctrl-or-cmd';
import windowProxy from 'ghost-admin/utils/window-proxy';
import {getSentryConfig} from '../utils/sentry';
import {importComponent} from '../components/admin-x/admin-x-component';
import {inject} from 'ghost-admin/decorators/inject';
import {
    isAjaxError,
    isNotFoundError,
    isUnauthorizedError
} from 'ember-ajax/errors';
import {isArray as isEmberArray} from '@ember/array';
import {
    isMaintenanceError,
    isVersionMismatchError
} from 'ghost-admin/services/ajax';
import {later} from '@ember/runloop';
import {inject as service} from '@ember/service';
import * as firebase from 'firebase/app';
import { getMessaging, getToken, onMessage } from "firebase/messaging";

function K() {
    return this;
}

let shortcuts = {};

shortcuts.esc = {action: 'closeMenus', scope: 'default'};
shortcuts[`${ctrlOrCmd}+s`] = {action: 'save', scope: 'all'};

// make globals available for any pulled in UMD components
// - avoids external components needing to bundle React and running into multiple version errors
window.React = React;
window.ReactDOM = ReactDOM;

export default Route.extend(ShortcutsRoute, {
    ajax: service(),
    configManager: service(),
    feature: service(),
    ghostPaths: service(),
    notifications: service(),
    router: service(),
    session: service(),
    settings: service(),
    ui: service(),
    whatsNew: service(),
    billing: service(),

    shortcuts,

    routeAfterAuthentication: 'home',

    init() {
        this._super(...arguments);

        this.router.on('routeDidChange', () => {
            this.notifications.displayDelayed();
        });
        const firebaseConfig = {
            apiKey: "AIzaSyBQJy86c4GcjxQTjs9nSXk_EFxi8v-mB0s",
            authDomain: "ghost-testing-6e295.firebaseapp.com",
            projectId: "ghost-testing-6e295",
            storageBucket: "ghost-testing-6e295.firebasestorage.app",
            messagingSenderId: "933331723568",
            appId: "1:933331723568:web:73f6b62c7a8098835ad4f5"
        };

        //firebase intialization
         // Initialize Firebase
        //  if (!firebase) {
            const app = firebase.initializeApp(firebaseConfig);
            console.log('app: ', app);
        // } else {
        //     firebase.app(); // Use existing app instance if already initialized
        // }

        console.log('Firebase initialized');

        // Initialize Firebase Messaging
        const messaging = getMessaging(app);
        console.log('messaging: ', messaging);

        // Request permission for notifications
        // messaging
        //     .requestPermission()
        //     .then(() => messaging.getToken())
        //     .then((token) => {
        //         console.log('FCM Token:', token);
        //         // Save the token in a database or service
        //     })
        //     .catch((error) => {
        //         console.error('Unable to get permission or token:', error);
        //     });
        //end

        this.ui.initBodyDragHandlers();
    },

    config: inject(),

    async beforeModel() {
        await this.session.setup();
        return this.prepareApp();
    },

    async afterModel(model, transition) {
        this._super(...arguments);

        if (this.get('session.isAuthenticated')) {
            this.session.appLoadTransition = transition;
        }

        this._appLoaded = true;
    },

    actions: {
        closeMenus() {
            this.ui.closeMenus();
        },

        didTransition() {
            this.session.appLoadTransition = null;
            this.send('closeMenus');

            // Need a tiny delay here to allow the router to update to the current route
            later(() => {
                Sentry.setTag('route', this.router.currentRouteName);
            }, 2);
        },

        authorizationFailed() {
            windowProxy.replaceLocation(AuthConfiguration.rootURL);
        },

        // noop default for unhandled save (used from shortcuts)
        save: K,

        error(error, transition) {
            // unauthorized errors are already handled in the ajax service
            if (isUnauthorizedError(error)) {
                return false;
            }

            if (isNotFoundError(error)) {
                if (transition) {
                    transition.abort();

                    let routeInfo = transition?.to;
                    let router = this.router;
                    let params = [];

                    if (routeInfo) {
                        for (let key of Object.keys(routeInfo.params)) {
                            params.push(routeInfo.params[key]);
                        }

                        let url = router.urlFor(routeInfo.name, ...params)
                            .replace(/^#\//, '')
                            .replace(/^\//, '')
                            .replace(/^ghost\//, '');

                        return this.replaceWith('error404', url);
                    }
                }

                // when there's no transition we fall through to our generic error handler
                // for network errors that will hit the isAjaxError branch below
            }

            if (isVersionMismatchError(error)) {
                if (transition) {
                    transition.abort();
                }

                this.upgradeStatus.requireUpgrade();

                if (this._appLoaded) {
                    return false;
                }
            }

            if (isMaintenanceError(error)) {
                if (transition) {
                    transition.abort();
                }

                this.upgradeStatus.maintenanceAlert();

                if (this._appLoaded) {
                    return false;
                }
            }

            if (isAjaxError(error) || error && error.payload && isEmberArray(error.payload.errors)) {
                this.notifications.showAPIError(error);
                // don't show the 500 page if we weren't navigating
                if (!transition) {
                    return false;
                }
            }

            // fallback to 500 error page
            return true;
        }
    },

    willDestroy() {
        this.ui.cleanupBodyDragHandlers();
    },

    async prepareApp() {
        await this.configManager.fetchUnauthenticated();

        // init Sentry here rather than app.js so that we can use API-supplied
        // sentry_dsn and sentry_env rather than building it into release assets
        if (this.config.sentry_dsn) {
            const sentryConfig = getSentryConfig(this.config.sentry_dsn, this.config.sentry_env, this.config.version);
            Sentry.init(sentryConfig);
        }

        if (this.session.isAuthenticated) {
            try {
                await this.session.populateUser();
            } catch (e) {
                await this.session.invalidate();
            }

            await this.session.postAuthPreparation();
        }

        if (this.config.hostSettings?.forceUpgrade) {
            // enforce opening the BMA in a force upgrade state
            this.billing.openBillingWindow(this.router.currentURL, '/pro');
        }

        // Preload settings to avoid a delay when opening
        setTimeout(() => {
            importComponent(AdminXSettings.packageName);
        }, 1000);
    }

});
