// let messaging = null

fetch("/config.json")
    .then((response) => response.json())
    .then((data) => {
        const firebaseConfig = data;
        console.log(data, "Data");
        firebase.initializeApp(firebaseConfig);
        messaging = firebase.messaging();
        function requestNotificationPermission() {
            Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                    console.log("LOCATION", window.location.href);
                    console.log("Notification permission granted.");
                    getTokenAndStore();
                } else {
                    console.log("Notification permission denied.");
                }
            });
        }

        // Function to send FCM token to the server using fetch
        function sendFcmTokenToServer(fcmToken) {
            fetch(`${window.location.href}members/api/member/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ fcm_token: fcmToken }),
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log("FCM token sent successfully:", data);
                })
                .catch((error) => {
                    console.error("Error sending FCM token:", error);
                });
        }

        // Get token and store it in Firestore
        function getTokenAndStore() {
            messaging
                .getToken({
                    vapidKey:firebaseConfig.vapidKey
                })
                .then((currentToken) => {
                    if (currentToken) {
                        console.log("Token retrieved: ", currentToken);
                        sendFcmTokenToServer(currentToken);
                    } else {
                        console.log(
                            "No registration token available. Request permission to generate one."
                        );
                    }
                })
                .catch((error) => {
                    console.error(
                        "An error occurred while retrieving token. ",
                        error
                    );
                });
        }

        // Handle foreground messages
        // Handle foreground messages
        messaging.onMessage((payload) => {
            console.log("Message received in foreground: ", payload);
            const { notification, data } = payload;
            const url = data?.url
            const notificationTitle = notification.title;
            const notificationOptions = {
                body: notification.body,
                icon: notification.image,
            };
        
            // Create a snackbar notification
            const snackbar = createSnackbar(notificationTitle, notificationOptions, url);
        
            // Append snackbar to body
            document.body.appendChild(snackbar);
        
            // Trigger the slide-in effect
            setTimeout(() => {
                snackbar.style.right = "20px";
            }, 10);
        
            // Automatically hide the snackbar after 5 seconds
            setTimeout(() => {
                snackbar.style.right = "-350px";
                setTimeout(() => {
                    document.body.removeChild(snackbar);
                }, 500);
            }, 5000);
        });
        
        // Modify the snackbar to handle clicks
        function createSnackbar(title, options, url) {
            const snackbar = document.createElement("div");
            snackbar.style.position = "fixed";
            snackbar.style.top = "20px";
            snackbar.style.right = "-350px";
            snackbar.style.width = "300px";
            snackbar.style.padding = "10px 20px";
            snackbar.style.backgroundColor = "#323232";
            snackbar.style.color = "#fff";
            snackbar.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
            snackbar.style.borderRadius = "4px";
            snackbar.style.zIndex = "1000";
            snackbar.style.display = "flex";
            snackbar.style.alignItems = "center";
            snackbar.style.transition = "right 0.5s ease";
            snackbar.style.cursor = "pointer"; // Make it clickable
        
            // Add image
            const img = document.createElement("img");
            img.src = options.icon;
            img.style.width = "40px";
            img.style.height = "40px";
            img.style.borderRadius = "50%";
            img.style.marginRight = "10px";
            snackbar.appendChild(img);
        
            // Add content container
            const content = document.createElement("div");
            content.style.flex = "1";
        
            // Add title
            const titleElement = document.createElement("h4");
            titleElement.innerText = title;
            titleElement.style.margin = "0";
            titleElement.style.fontSize = "16px";
            content.appendChild(titleElement);
        
            snackbar.appendChild(content);
        
            // Add close button
            const closeButton = document.createElement("button");
            closeButton.innerText = "Close";
            closeButton.style.marginLeft = "10px";
            closeButton.style.padding = "5px 10px";
            closeButton.style.border = "none";
            closeButton.style.backgroundColor = "#007bff";
            closeButton.style.color = "#fff";
            closeButton.style.borderRadius = "4px";
            closeButton.style.cursor = "pointer";
            closeButton.addEventListener("click", (event) => {
                event.stopPropagation(); // Prevent redirection on close click
                snackbar.style.right = "-350px";
                setTimeout(() => {
                    document.body.removeChild(snackbar);
                }, 500);
            });
        
            snackbar.appendChild(closeButton);
        
            // Add click event to redirect to URL
            snackbar.addEventListener("click", () => {
                window.location.href = url; // Opens URL in the same tab
            });
        
        
            return snackbar;
        }

        if (Notification.permission !== "granted") {
            document.addEventListener("DOMContentLoaded", () => {
                const modal = document.createElement("div");
                modal.style.position = "fixed";
                modal.style.top = "0";
                modal.style.left = "0";
                modal.style.width = "100%";
                modal.style.height = "100%";
                modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                modal.style.display = "flex";
                modal.style.justifyContent = "center";
                modal.style.alignItems = "center";
                modal.style.zIndex = "1000";

                const modalContent = document.createElement("div");
                modalContent.style.backgroundColor = "#fff";
                modalContent.style.padding = "20px";
                modalContent.style.borderRadius = "4px";
                modalContent.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
                modalContent.style.textAlign = "center";

                const modalText = document.createElement("p");
                modalText.textContent =
                    "We would like to send you notifications. Please grant permission.";

                const modalButton = document.createElement("button");
                modalButton.textContent = "Enable Notifications";
                modalButton.style.marginTop = "10px";
                modalButton.addEventListener("click", () => {
                    requestNotificationPermission();
                    document.body.removeChild(modal);
                });

                modalContent.appendChild(modalText);
                modalContent.appendChild(modalButton);
                modal.appendChild(modalContent);
                document.body.appendChild(modal);
            });
        }
    })
    .catch((error) => {
        console.error("Error fetching config:", error);
    });
