module.exports = {
    roots: ['<rootDir>'],
    transform: {
        '^.+\\.(ts|tsx)?$': 'ts-jest',
    },
    globals: {
        "ts-jest": {
            isolatedModules: true
        }
    },
    setupFiles: [
        "./test/setUpJestMock.ts"
    ],
    transformIgnorePatterns: [
    ],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    clearMocks: true,
    preset: 'ts-jest',
    "reporters": [
        "default",
        [
            "./node_modules/jest-html-reporter",
            {
                "pageTitle": "Test Report",
                "includeSuiteFailure": true,
                "includeConsoleLog": true,
                "includeFailureMsg": true
            }
        ]

    ]
};
