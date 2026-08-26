// admin.messaging
const response = {
    MessagingTopicManagementResponse: {
        errors: [FirebaseArrayIndexError],	// An array of errors corresponding to the provided registration token(s). The length of this array will be equal to MessagingTopicManagementResponse.failureCount.
        failureCount: number,	            // The number of registration tokens that could not be subscribed to the topic and resulted in an error.
        successCount: number,           	// The number of registration tokens that were successfully subscribed to the topic.
    },
    SendResponse: {
        error: FirebaseError, // An error, if the message was not handed off to FCM successfully.
        messageId: string,    // A unique message ID string, if the message was handed off to FCM for delivery.
        success: boolean,     // A boolean indicating if the message was successfully handed off to FCM or not. When true, the messageId attribute is guaranteed to be set. When false, the error attribute is guaranteed to be set.
    },
    BatchResponse: {
        responses: [SendResponse], // An array of responses, each corresponding to a message.
        failureCount: number,      // The number of messages that resulted in errors when sending.
        successCount: number       // The number of messages that were successfully handed off for sending.
    },
    MessagingDevicesResponse: {
        canonicalRegistrationTokenCount: number,
        multicastId: number,
        failureCount: number,
        successCount: number,
        results: [MessagingDeviceResult],
    },
    MessagingDeviceResult: {
        canonicalRegistrationToken: string,  // The canonical registration token for the client app that the message was processed and sent to. You should use this value as the registration token for future requests. Otherwise, future messages might be rejected.
        error: FirebaseError,	            // The error that occurred when processing the message for the recipient.
        messageId: string,	                // A unique ID for the successfully processed message.
    },
    MessagingDeviceGroupResponse: {
        failedRegistrationTokens: [string],	 // An array of registration tokens that failed to receive the message.
        failureCount: number,	             // The number of messages that could not be processed and resulted in an error.
        successCount: number,	             // The number of messages that could not be processed and resulted in an error.
    },
    MessagingTopicResponse: {
        messageId: number // The message ID for a successfully received request which FCM will attempt to deliver to all subscribed devices.	
    },
    MessagingConditionResponse: {
        messageId: number // The message ID for a successfully received request which FCM will attempt to deliver to all subscribed devices.
    },
}

MESSAGE = {
    notification: {
        body: string,	        // The notification body
        imageUrl: string,	    // URL of an image to be displayed in the notification.
        title: string,	        // The title of the notification.
    },
    data: { "[key: string]": string },
    fcmOptions: {
        analyticsLabel: string  // The label associated with the message's analytics data.
    },
    webpush: {
        notification: WebpushNotification,  	// A WebPush notification payload to be included in the message.
        data: { "[key: string]": string },  	// A collection of data fields.
        headers: { "[key: string]": string },	// A collection of WebPush headers. Header values must be strings.See WebPush specification for supported headers.
        fcmOptions: WebpushFcmOptions,	        // Options for features provided by the FCM SDK for Web.
    },
    android: {
        collapseKey: string,	            // Collapse key for the message. Collapse key serves as an identifier for a group of messages that can be collapsed, so that only the last message gets sent when delivery can be resumed. A maximum of four different collapse keys may be active at any given time.
        notification: { 	                // Android notification to be included in the message.
            title: string,	                    // Title of the Android notification. When provided, overrides the title set via admin.messaging.Notification.
            body: string,                       // Body of the Android notification. When provided, overrides the body set via admin.messaging.Notification.
            imageUrl: string,	                // URL of an image to be displayed in the notification.
            bodyLocArgs: [string],	            // An array of resource keys that will be used in place of the format specifiers in bodyLocKey.
            bodyLocKey: string,	                // Key of the body string in the app's string resource to use to localize the body text.
            channelId: string,	                // The Android notification channel ID (new in Android O). The app must create a channel with this channel ID before any notification with this channel ID can be received. If you don't send this channel ID in the request, or if the channel ID provided has not yet been created by the app, FCM uses the channel ID specified in the app manifest.
            clickAction: string,	            // Action associated with a user click on the notification. If specified, an activity with a matching Intent Filter is launched when a user clicks on the notification.
            color: string,	                    // Notification icon color in #rrggbb format.
            defaultLightSettings: boolean,	    // If set to true, use the Android framework's default LED light settings for the notification. Default values are specified in config.xml. If default_light_settings is set to true and light_settings is also set, the user-specified light_settings is used instead of the default value.
            defaultSound: boolean,	            // If set to true, use the Android framework's default sound for the notification. Default values are specified in config.xml.
            defaultVibrateTimings: boolean,	    // If set to true, use the Android framework's default vibrate pattern for the notification. Default values are specified in config.xml. If default_vibrate_timings is set to true and vibrate_timings is also set, the default value is used instead of the user-specified vibrate_timings.
            eventTimestamp: Date,	            // For notifications that inform users about events with an absolute time reference, sets the time that the event in the notification occurred. Notifications in the panel are sorted by this time.
            icon: string,	                    // Icon resource for the Android notification.
            lightSettings: LightSettings,	    // Settings to control the notification's LED blinking rate and color if LED is available on the device. The total blinking time is controlled by the OS.
            localOnly: boolean,	                // Sets whether or not this notification is relevant only to the current device. Some notifications can be bridged to other devices for remote display, such as a Wear OS watch. This hint can be set to recommend this notification not be bridged. See Wear OS guides.
            notificationCount: number,	        // Sets the number of items this notification represents. May be displayed as a badge count for Launchers that support badging. See NotificationBadge. For example, this might be useful if you're using just one notification to represent multiple new messages but you want the count here to represent the number of total new messages. If zero or unspecified, systems that support badging use the default, which is to increment a number displayed on the long-press menu each time a new notification arrives.
            priority: ('min' | 'low' | 'default' | 'high' | 'max'),	    // Sets the relative priority for this notification. Low-priority notifications may be hidden from the user in certain situations. Note this priority differs from AndroidMessagePriority. This priority is processed by the client after the message has been delivered. Whereas AndroidMessagePriority is an FCM concept that controls when the message is delivered.
            sound: string,	                    // File name of the sound to be played when the device receives the notification.
            sticky: boolean,	                // When set to false or unset, the notification is automatically dismissed when the user clicks it in the panel. When set to true, the notification persists even when the user clicks it.
            tag: string,	                    // Notification tag. This is an identifier used to replace existing notifications in the notification drawer. If not specified, each request creates a new notification.
            ticker: string,	                    // Sets the "ticker" text, which is sent to accessibility services. Prior to API level 21 (Lollipop), sets the text that is displayed in the status bar when the notification first arrives.
            titleLocArgs: [string],	            // An array of resource keys that will be used in place of the format specifiers in titleLocKey.
            titleLocKey: string,                // Key of the title string in the app's string resource to use to localize the title text.
            vibrateTimingsMillis: [number],	    // Sets the vibration pattern to use. Pass in an array of milliseconds to turn the vibrator on or off. The first value indicates the duration to wait before turning the vibrator on. The next value indicates the duration to keep the vibrator on. Subsequent values alternate between duration to turn the vibrator off and to turn the vibrator on. If vibrate_timings is set and default_vibrate_timings is set to true, the default value is used instead of the user-specified vibrate_timings.
            visibility: 
            ('private' | 'public' | 'secret'),	// Sets the visibility of the notification. Must be either private, public, or secret. If unspecified, defaults to private.
        },
        data: { "[key: string]": string },	// A collection of data fields to be included in the message. All values must be strings. When provided, overrides any data fields set on the top-level Message.
        fcmOptions: AndroidFcmOptions,	    // Options for features provided by the FCM SDK for Android.
        priority: ('high' | 'normal'),	    // Priority of the message. Must be either normal or high.
        restrictedPackageName: string,	    // Package name of the application where the registration tokens must match in order to receive the message.
        ttl: number	                        // Time-to-live duration of the message in milliseconds.
    },
    apns: {
        payload: ApnsPayload,	                // An APNs payload to be included in the message.
        headers: { "[key: string]": string },	// A collection of APNs headers. Header values must be strings.
        fcmOptions: ApnsFcmOptions,	            // Options for features provided by the FCM SDK for iOS.
    },
}

Message = {
    android: AndroidConfig,
    apns: ApnsConfig,
    data: { "[key: string]": string },
    fcmOptions: FcmOptions,
    notification: Notification,
    webpush: WebpushConfig,
}

AndroidConfig = {
    collapseKey: string,	            // Collapse key for the message. Collapse key serves as an identifier for a group of messages that can be collapsed, so that only the last message gets sent when delivery can be resumed. A maximum of four different collapse keys may be active at any given time.
    data: { "[key: string]": string },	// A collection of data fields to be included in the message. All values must be strings. When provided, overrides any data fields set on the top-level Message.
    fcmOptions: AndroidFcmOptions,	    // Options for features provided by the FCM SDK for Android.
    notification: AndroidNotification,	// Android notification to be included in the message.
    priority: ('high' | 'normal'),	    // Priority of the message. Must be either normal or high.
    restrictedPackageName: string,	    // Package name of the application where the registration tokens must match in order to receive the message.
    ttl: number	                        // Time-to-live duration of the message in milliseconds.
},

AndroidNotification = {
    title: string,	                    // Title of the Android notification. When provided, overrides the title set via admin.messaging.Notification.
    body: string,                       // Body of the Android notification. When provided, overrides the body set via admin.messaging.Notification.
    imageUrl: string,	                // URL of an image to be displayed in the notification.
    bodyLocArgs: [string],	            // An array of resource keys that will be used in place of the format specifiers in bodyLocKey.
    bodyLocKey: string,	                // Key of the body string in the app's string resource to use to localize the body text.
    channelId: string,	                // The Android notification channel ID (new in Android O). The app must create a channel with this channel ID before any notification with this channel ID can be received. If you don't send this channel ID in the request, or if the channel ID provided has not yet been created by the app, FCM uses the channel ID specified in the app manifest.
    clickAction: string,	            // Action associated with a user click on the notification. If specified, an activity with a matching Intent Filter is launched when a user clicks on the notification.
    color: string,	                    // Notification icon color in #rrggbb format.
    defaultLightSettings: boolean,	    // If set to true, use the Android framework's default LED light settings for the notification. Default values are specified in config.xml. If default_light_settings is set to true and light_settings is also set, the user-specified light_settings is used instead of the default value.
    defaultSound: boolean,	            // If set to true, use the Android framework's default sound for the notification. Default values are specified in config.xml.
    defaultVibrateTimings: boolean,	    // If set to true, use the Android framework's default vibrate pattern for the notification. Default values are specified in config.xml. If default_vibrate_timings is set to true and vibrate_timings is also set, the default value is used instead of the user-specified vibrate_timings.
    eventTimestamp: Date,	            // For notifications that inform users about events with an absolute time reference, sets the time that the event in the notification occurred. Notifications in the panel are sorted by this time.
    icon: string,	                    // Icon resource for the Android notification.
    lightSettings: LightSettings,	    // Settings to control the notification's LED blinking rate and color if LED is available on the device. The total blinking time is controlled by the OS.
    localOnly: boolean,	                // Sets whether or not this notification is relevant only to the current device. Some notifications can be bridged to other devices for remote display, such as a Wear OS watch. This hint can be set to recommend this notification not be bridged. See Wear OS guides.
    notificationCount: number,	        // Sets the number of items this notification represents. May be displayed as a badge count for Launchers that support badging. See NotificationBadge. For example, this might be useful if you're using just one notification to represent multiple new messages but you want the count here to represent the number of total new messages. If zero or unspecified, systems that support badging use the default, which is to increment a number displayed on the long-press menu each time a new notification arrives.
    priority: ('min' | 'low' | 'default' | 'high' | 'max'),	    // Sets the relative priority for this notification. Low-priority notifications may be hidden from the user in certain situations. Note this priority differs from AndroidMessagePriority. This priority is processed by the client after the message has been delivered. Whereas AndroidMessagePriority is an FCM concept that controls when the message is delivered.
    sound: string,	                    // File name of the sound to be played when the device receives the notification.
    sticky: boolean,	                // When set to false or unset, the notification is automatically dismissed when the user clicks it in the panel. When set to true, the notification persists even when the user clicks it.
    tag: string,	                    // Notification tag. This is an identifier used to replace existing notifications in the notification drawer. If not specified, each request creates a new notification.
    ticker: string,	                    // Sets the "ticker" text, which is sent to accessibility services. Prior to API level 21 (Lollipop), sets the text that is displayed in the status bar when the notification first arrives.
    titleLocArgs: [string],	            // An array of resource keys that will be used in place of the format specifiers in titleLocKey.
    titleLocKey: string,                // Key of the title string in the app's string resource to use to localize the title text.
    vibrateTimingsMillis: [number],	    // Sets the vibration pattern to use. Pass in an array of milliseconds to turn the vibrator on or off. The first value indicates the duration to wait before turning the vibrator on. The next value indicates the duration to keep the vibrator on. Subsequent values alternate between duration to turn the vibrator off and to turn the vibrator on. If vibrate_timings is set and default_vibrate_timings is set to true, the default value is used instead of the user-specified vibrate_timings.
    visibility: 
    ('private' | 'public' | 'secret'),	// Sets the visibility of the notification. Must be either private, public, or secret. If unspecified, defaults to private.
}

ApnsConfig = {
    fcmOptions: ApnsFcmOptions,	            // Options for features provided by the FCM SDK for iOS.
    headers: { "[key: string]": string },	// A collection of APNs headers. Header values must be strings.
    payload: ApnsPayload	                // An APNs payload to be included in the message.
}

FcmOptions = {
    analyticsLabel: string                  // The label associated with the message's analytics data.
}

Notification = {
    body: string,	    // The notification body
    imageUrl: string,	// URL of an image to be displayed in the notification.
    title: string,	    // The title of the notification.
}

WebpushConfig = {
    data: { "[key: string]": string },  	// A collection of data fields.
    fcmOptions: WebpushFcmOptions,	        // Options for features provided by the FCM SDK for Web.
    headers: { "[key: string]": string },	// A collection of WebPush headers. Header values must be strings.See WebPush specification for supported headers.
    notification: WebpushNotification,  	// A WebPush notification payload to be included in the message.
}

MessagingPayload = {
    data: DataMessagePayload,	                // The data message payload.
    notification: NotificationMessagePayload    // The notification message payload.
}

NotificationMessagePayload = {
    title: string,          // The notification's title.**Platforms:** iOS, Android, Web
    body: string,	        // The notification's body text.**Platforms:** iOS, Android, Web
    badge: string,	        // The value of the badge on the home screen app icon.If not specified, the badge is not changed.If set to 0, the badge is removed.**Platforms:** iOS
    sound: string,	        // The sound to be played when the device receives a notification. Supports "default" for the default notification sound of the device or the filename of a sound resource bundled in the app. Sound files must reside in /res/raw/.**Platforms:** Android
    bodyLocArgs: string,	// Variable string values to be used in place of the format specifiers in body_loc_key to use to localize the body text to the user's current localization.The value should be a stringified JSON array.**iOS:** Corresponds to loc-args in the APNs payload. See Payload Key Reference and Localizing the Content of Your Remote Notifications for more information.**Android:** See Formatting and Styling for more information.**Platforms:** iOS, Android
    bodyLocKey: string, 	// The key to the body string in the app's string resources to use to localize the body text to the user's current localization.**iOS:** Corresponds to loc-key in the APNs payload. See Payload Key Reference and Localizing the Content of Your Remote Notifications for more information.**Android:** See String Resources for more information.**Platforms:** iOS, Android
    clickAction: string, 	// Action associated with a user click on the notification. If specified, an activity with a matching Intent Filter is launched when a user clicks on the notification.* **Platforms:** Android
    color: string,	        // The notification icon's color, expressed in #rrggbb format.**Platforms:** Android
    icon: string,	        // The notification's icon.**Android:** Sets the notification icon to myicon for drawable resource myicon. If you don't send this key in the request, FCM displays the launcher icon specified in your app manifest.**Web:** The URL to use for the notification's icon.**Platforms:** Android, Web
    tag: string,	        // Identifier used to replace existing notifications in the notification drawer.If not specified, each request creates a new notification.If specified and a notification with the same tag is already being shown, the new notification replaces the existing one in the notification drawer.**Platforms:** Android
    titleLocArgs: string,	// Variable string values to be used in place of the format specifiers in title_loc_key to use to localize the title text to the user's current localization.The value should be a stringified JSON array.**iOS:** Corresponds to title-loc-args in the APNs payload. See Payload Key Reference and Localizing the Content of Your Remote Notifications for more information.**Android:** See Formatting and Styling for more information.**Platforms:** iOS, Android
    titleLocKey: string	    // The key to the title string in the app's string resources to use to localize the title text to the user's current localization.**iOS:** Corresponds to title-loc-key in the APNs payload. See Payload Key Reference and Localizing the Content of Your Remote Notifications for more information.**Android:** See String Resources for more information.**Platforms:** iOS, Android
}

MessagingOptions = {
    collapseKey: string,	        // String identifying a group of messages (for example, "Updates Available") that can be collapsed, so that only the last message gets sent when delivery can be resumed. This is used to avoid sending too many of the same messages when the device comes back online or becomes active.There is no guarantee of the order in which messages get sent.A maximum of four different collapse keys is allowed at any given time. This means FCM server can simultaneously store four different send-to-sync messages per client app. If you exceed this number, there is no guarantee which four collapse keys the FCM server will keep.**Default value:** None
    contentAvailable: boolean,	    // On iOS, use this field to represent content-available in the APNs payload. When a notification or data message is sent and this is set to true, an inactive client app is awoken. On Android, data messages wake the app by default. On Chrome, this flag is currently not supported.**Default value:** false
    dryRun: boolean,	            // Whether or not the message should actually be sent. When set to true, allows developers to test a request without actually sending a message. When set to false, the message will be sent.**Default value:** false
    mutableContent: boolean,        // On iOS, use this field to represent mutable-content in the APNs payload. When a notification is sent and this is set to true, the content of the notification can be modified before it is displayed, using a Notification Service app extension.On Android and Web, this parameter will be ignored.**Default value:** false
    priority: string,	            // The priority of the message. Valid values are "normal" and "high". On iOS, these correspond to APNs priorities 5 and 10.By default, notification messages are sent with high priority, and data messages are sent with normal priority. Normal priority optimizes the client app's battery consumption and should be used unless immediate delivery is required. For messages with normal priority, the app may receive the message with unspecified delay.When a message is sent with high priority, it is sent immediately, and the app can wake a sleeping device and open a network connection to your server.For more information, see Setting the priority of a message.**Default value:** "high" for notification messages, "normal" for data messages
    restrictedPackageName: string,	// The package name of the application which the registration tokens must match in order to receive the message.**Default value:** None
    timeToLive: number,	            // How long (in seconds) the message should be kept in FCM storage if the device is offline. The maximum time to live supported is four weeks, and the default value is also four weeks. For more information, see Setting the lifespan of a message.**Default value:** 2419200 (representing four weeks, in seconds)
}