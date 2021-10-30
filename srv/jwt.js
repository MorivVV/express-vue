import parseJwk from 'jose/jwk/parse'
import SignJWT from 'jose/jwt/sign'
import CompactEncrypt from 'jose/jwe/compact/encrypt'

const encode = TextEncoder.prototype.encode.bind(new TextEncoder());

const jwk = {
    crv: 'P-256',
    x: 'FM3c0AK77LZbxb2LCmUI-Y83DpX04HfakfD1fgfaMVw',
    y: 'fw7dMgz5uHqxbAaYUwgz0IarSIXfkGFP0qTDyC_rkx0',
    d: 'VOh1aBPFq8f1nLh-wQzp5B1WglsJZyhhlUeUWIOZ3mc',
    kty: 'EC',
    kid: 'd2bwmrR5AoI9A0FgNTFxtcNyTPlQTinRxuXUG9uOOWY',
}

const privateKey = await parseJwk(jwk, 'ES256')

// Create a signed JWT
const jwt = await new SignJWT({})
    .setSubject('alice')
    .setIssuedAt()
    .setIssuer('https://op.example.com')
    .setProtectedHeader({
        alg: 'ES256',
        kid: jwk.kid,
    })
    .sign(privateKey)

// Create JWE object with signed JWT as payload
const recipientJwk = {
    e: 'AQAB',
    kid: 'CZSMR6mZCn2dxWzRFP9upf2onQkVIaQld92fyb6a5HE',
    kty: 'RSA',
    n: 'uDwQ0ON7rzg6w3BobsBTf9XU6bsGAfc234beMZGHYHfFx3GZqe2YC46yd0xFKY1_yJIDzhwUMOpFfqrtHxDjER-9Q2Lwap3VLad6p3KRf-WAkEWxpgk7fkdQEkrqyxlC5GPRnwUXQ0NRlPRRgFVvlIcRQU5GG-gbPqAhM0UcdFS4He82a1YozQyByC3TG7K3gVBzeh-yT2psbpgl4UeuTnpwlRgrqxYY-PQsBHnEWJ2C7L9bZFGmUNrCOsOqe2ngJvdVit-UJKtXQ7CRx0jpR9l1d0_B0iCEi1ic6hacxYO5QMmV8tQPHHnhB2QA5zAvjXC7fIxlZoGRb1oqhZ147w',
    use: 'enc'
}
const recipientPublicKey = await parseJwk(recipientJwk, 'RSA-OAEP-256')

const jwe = await new CompactEncrypt(encode(jwt))
    .setProtectedHeader({
        alg: 'RSA-OAEP-256',
        enc: 'A256GCM',
        kid: recipientJwk.kid,
    })
    .encrypt(recipientPublicKey)