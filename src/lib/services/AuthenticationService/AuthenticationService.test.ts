import { wait } from "@testing-library/react";
import client from "lib/client/client";
import AuthenticationService from "lib/services/AuthenticationService/AuthenticationService";
import { GC_API_TOKEN, OTP_AUTH_KEY } from "test-utils/config/localStorageKeys";

describe("Methods with API calls", () => {
  let mockPost: jest.SpyInstance;
  beforeAll(() => (mockPost = jest.spyOn(client, "post")));
  afterEach(() => mockPost.mockClear());
  afterAll(() => mockPost.mockRestore());

  describe("sendPin", () => {
    const otpAuthKey = "fdsfdsaffdsaklfds";
    const mobile = "+85262345678";
    beforeAll(() => {
      mockPost.mockResolvedValue({
        otp_auth_key: otpAuthKey,
      });
    });
    afterEach(() => localStorage.removeItem(OTP_AUTH_KEY));

    describe("on successful response", () => {
      it(`should call client with auth/send_pin and the correct data`, () => {
        AuthenticationService.sendPin({ mobile });
        expect(mockPost).toHaveBeenCalledTimes(1);
        expect(mockPost).toHaveBeenCalledWith("auth/send_pin", { mobile });
      });

      it("should store received token in localStorage", async () => {
        expect(localStorage.getItem(OTP_AUTH_KEY)).toBeNull();
        await AuthenticationService.sendPin({ mobile });
        expect(localStorage.getItem(OTP_AUTH_KEY)).toBe(otpAuthKey);
      });
    });

    describe("on unsuccessful response", () => {
      const error = new Error();
      beforeAll(() => mockPost.mockRejectedValue(error));
      afterAll(() => mockPost.mockReset());

      it("should just throw the error", () => {
        return expect(
          AuthenticationService.sendPin({ mobile })
        ).rejects.toThrow(error);
      });

      it(`should NOT set ${OTP_AUTH_KEY}`, async () => {
        expect.assertions(2);
        expect(localStorage.getItem(OTP_AUTH_KEY)).toBeNull();
        try {
          await AuthenticationService.sendPin({ mobile });
        } catch (e) {
          expect(localStorage.getItem(OTP_AUTH_KEY)).toBeNull();
        }
      });
    });
  });

  describe("authenticate", () => {
    const jwtToken = "ejsdfslk3fdsa";
    const otpAuthKey = "sdfscsd2fdsjklf2fs";
    const pin = "1234";
    beforeAll(() =>
      mockPost.mockResolvedValue({
        jwt_token: jwtToken,
      })
    );
    beforeEach(() => localStorage.setItem(OTP_AUTH_KEY, otpAuthKey));
    afterEach(() => localStorage.removeItem(GC_API_TOKEN));
    afterAll(() => mockPost.mockRestore());

    describe("On successful response", () => {
      it("should call client with auth/verify and the correct data", async () => {
        AuthenticationService.authenticate(pin);

        expect(mockPost).toHaveBeenCalledTimes(1);
        expect(mockPost).toHaveBeenCalledWith("auth/verify", {
          pin,
          otp_auth_key: otpAuthKey,
        });
      });

      it(`should set ${GC_API_TOKEN} with the received jwt_token`, async () => {
        expect(localStorage.getItem(GC_API_TOKEN)).toBeNull();
        AuthenticationService.authenticate(pin);
        await wait(() =>
          expect(localStorage.getItem(GC_API_TOKEN)).toBe(jwtToken)
        );
      });

      it(`should clear ${OTP_AUTH_KEY} from localStorage`, async () => {
        localStorage.setItem(OTP_AUTH_KEY, otpAuthKey);
        AuthenticationService.authenticate(pin);
        await wait(() => expect(localStorage.getItem(OTP_AUTH_KEY)).toBeNull());
      });
    });

    describe("On unsuccessful response", () => {
      const error = new Error();
      beforeAll(() => mockPost.mockRejectedValue(error));
      afterAll(() => mockPost.mockReset());

      it("should just throw the error", () => {
        return expect(AuthenticationService.authenticate(pin)).rejects.toThrow(
          error
        );
      });

      it(`should NOT set ${GC_API_TOKEN}`, async () => {
        expect.assertions(2);
        expect(localStorage.getItem(GC_API_TOKEN)).toBeNull();
        try {
          await AuthenticationService.authenticate(pin);
        } catch (e) {
          expect(localStorage.getItem(GC_API_TOKEN)).toBeNull();
        }
      });

      it(`should NOT remove ${OTP_AUTH_KEY}`, async () => {
        expect.assertions(2);
        expect(localStorage.getItem(OTP_AUTH_KEY)).not.toBeNull();
        try {
          await AuthenticationService.authenticate(pin);
        } catch (e) {
          expect(localStorage.getItem(OTP_AUTH_KEY)).not.toBeNull();
        }
      });
    });
  });
});

describe("logout", () => {
  it(`should remove ${GC_API_TOKEN} from localStorage`, () => {
    localStorage.setItem(GC_API_TOKEN, "fdsfsa");
    AuthenticationService.logout();
    expect(localStorage.getItem(GC_API_TOKEN)).toBeNull();
  });
});
