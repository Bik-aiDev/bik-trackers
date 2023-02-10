let timeout;
function setUpBik() {
    try {
        BIK({
            r: false,
            baseUrl: "https://api.staging.bik.ai/campaign",
            events: ["delivered", "read"],
            source: "shopify",
        });
        if (timeout) {
            clearInterval(timeout);
        }
    } catch (e) {
        if (e.message.includes("BIK is not defined")) {
            console.log("BIK not defined trying again");
            timeout = setTimeout(() => {
                setUpBik();
            }, 2500);
        }
    }
}
document.addEventListener("DOMContentLoaded", function (event) {
    setUpBik();
});