from rest_framework.throttling import AnonRateThrottle


class LoginThrottle(AnonRateThrottle):
    rate = '5/minute'
    scope = 'login'


class OTPThrottle(AnonRateThrottle):
    rate = '3/minute'
    scope = 'otp'
