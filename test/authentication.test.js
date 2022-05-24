const { getVerifiedClaims, authenticate } = require("../lib/middleware/authentication");

describe("authentication", () => {
  it("exports getVerifiedClaims for apps that need the claims manually", () => {
    expect(getVerifiedClaims).not.toBeUndefined();
  });

  it("ensure error message is preserved if custom errorTemplateObject is not used", async () => {
    const addon = {
      logger: {
        warn: jest.fn().mockReturnValue(true)
      },
      config: {
        expressErrorHandling: jest.fn().mockReturnValue(false),
        errorTemplate: jest.fn().mockReturnValue(true),
        errorTemplateName: jest.fn().mockReturnValue('custom-error.jsx'),
        errorTemplateObject: jest.fn().mockReturnValue(false)
      }
    };

    // Making req to be invalid such that getVerifiedClaims resolves to error 401 in object like below:
    // {
    //   code: 401,
    //   message: "Could not find authentication data on request",
    //   ctx: {}
    // }
    const req = {
      query: {
        test: "test"
      }
    };

    const res = {
      acceptedContentType: "text/html",
      format(overloaded_functions) {
        if (this.acceptedContentType === "text/html") {
          overloaded_functions.html();
        }
        if (this.acceptedContentType === "text/plain") {
          overloaded_functions.text();
        }
        if (this.acceptedContentType === "application/json") {
          overloaded_functions.json();
        }
      },
      // Mocking render function to alter res object such that it can be checked in test
      render(errorTemplateName, errorTemplateData) {
        this.errorTemplateName = errorTemplateName;
        this.message = errorTemplateData.message;
      }
    };
    authenticate(addon, undefined)(req, res, undefined);
    await new Promise(resolve => setTimeout(resolve, 10)); // added 10ms wait for getVerifiedClaims async call to resolve/reject
    expect(res.errorTemplateName).toEqual('custom-error.jsx');
    expect(res.message).toEqual('Could not find authentication data on request');
  });

  it("ensure both the original error message and the customErrorObject are preserved when custom errorTemplateObject is used", async () => {
    const addon = {
      logger: {
        warn: jest.fn().mockReturnValue(true)
      },
      config: {
        expressErrorHandling: jest.fn().mockReturnValue(false),
        errorTemplate: jest.fn().mockReturnValue(true),
        errorTemplateName: jest.fn().mockReturnValue('custom-error.jsx'),
        errorTemplateObject: jest.fn().mockReturnValue({ customKey: "customValue"})
      }
    };

    // Mocking req with invalid jwt token such that getVerifiedClaims resolves to error 401 in object like below:
    // {
    //   code: 401,
    //   message: "Invalid JWT: Not enough or too many JWT token segments; should be 3",
    //   ctx: {}
    // }
    const req = {
      query: {
        jwt: "test"
      },
      body: {
        test: 'test'
      },
      headers: {
        authorization: 'testAuth'
      }
    };

    const res = {
      acceptedContentType: "text/html",
      format(overloaded_functions) {
        if (this.acceptedContentType === "text/html") {
          overloaded_functions.html();
        }
        if (this.acceptedContentType === "text/plain") {
          overloaded_functions.text();
        }
        if (this.acceptedContentType === "application/json") {
          overloaded_functions.json();
        }
      },
      // Mocking render function to alter res object such that it can be checked in test
      render(errorTemplateName, errorTemplateData) {
        this.errorTemplateName = errorTemplateName;
        for (const [key, value] of Object.entries(errorTemplateData)) {
          this[key] = value;
        }
      }
    };
    authenticate(addon, undefined)(req, res, undefined);
    await new Promise(resolve => setTimeout(resolve, 10)); // added 10ms wait for getVerifiedClaims async call to resolve/reject
    expect(res.errorTemplateName).toEqual('custom-error.jsx');
    expect(res.message).toEqual('Invalid JWT: Not enough or too many JWT token segments; should be 3');
    expect(res.customKey).toEqual('customValue');
  });
});
