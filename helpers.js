const os = require('os');

function getLocalIp() {
    // Get a list of network interfaces
    const networkInterfaces = os.networkInterfaces();

    // Iterate through the interfaces and find the one that is not internal (e.g., 'lo')
    let localIpAddress = null;

    for (const interfaceName in networkInterfaces) {
        const interface = networkInterfaces[interfaceName];
        for (const addressInfo of interface) {
            if (!addressInfo.internal && addressInfo.family === 'IPv4') {
                localIpAddress = addressInfo.address;
                break;
            }
        }
        if (localIpAddress) {
            break;
        }
    }
    
    return localIpAddress;
}

module.exports = {
    getLocalIp
}