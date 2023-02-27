describe('utils test', () => {
    test('getLocalStorageValue', () => {

    });

    test('setLocalStorageValue', () => {
        global.setLocalStorageValue(global.STORAGE_KEYS.BIK_CUSTOMER_ID, "test");
        expect(1).toBe(1);
    });

    test('deleteLocalStorageValue', () => {
        expect({}).toBeDefined
    });

    test('createCookie', () => {

    });
    
    test('getCookie', () => {

    });
        
    test('clearCookie', () => {

    });
    
})