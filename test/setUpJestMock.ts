export function setUp() {
  setUpNavigatorForBrave();
}

export function setUpNavigatorForBrave(isBrave: boolean = false) {
  (window.navigator as any).brave = {
    isBrave: jest.fn().mockResolvedValue(isBrave),
  };
}
