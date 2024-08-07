import forge from 'node-forge';
import { Buffer } from 'buffer';
import { NativeModules } from 'react-native';

const { KeyChainModule } = NativeModules;

export async function installCertificate(certPem, privateKeyPem) {
  const certDer = forge.util.decode64(forge.util.encode64(forge.asn1.toDer(forge.pki.certificateToAsn1(forge.pki.certificateFromPem(certPem))).getBytes()));
  const keyDer = forge.util.decode64(forge.util.encode64(forge.asn1.toDer(forge.pki.privateKeyToAsn1(forge.pki.privateKeyFromPem(privateKeyPem))).getBytes()));

  const p12Asn1 = forge.pkcs12.toPkcs12Asn1(forge.pki.privateKeyFromPem(privateKeyPem), forge.pki.certificateFromPem(certPem), '', { algorithm: '3des' });
  const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
  const p12B64 = forge.util.encode64(p12Der);
  
  const p12Buffer = Buffer.from(p12B64, 'base64').toString('base64');

  try {
    await KeyChainModule.installCertificate(p12Buffer, 'MyClientCert');
  } catch (error) {
    console.error("Failed to install certificate", error);
  }
}

export function generateCA() {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  
  const attrs = [
    { name: 'commonName', value: 'My Local CA' },
  ];
  
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  
  cert.setExtensions([
    { name: 'basicConstraints', cA: true },
    { name: 'keyUsage', keyCertSign: true, digitalSignature: true, keyEncipherment: true },
  ]);

  cert.sign(keys.privateKey, forge.md.sha256.create());
  
  return { caCert: cert, caPrivateKey: keys.privateKey };
}

export function signCSR(csrPem, caCert, caPrivateKey) {
  const csr = forge.pki.certificationRequestFromPem(csrPem);
  const cert = forge.pki.createCertificate();
  
  cert.serialNumber = '02';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  
  cert.setSubject(csr.subject.attributes);
  cert.setIssuer(caCert.subject.attributes);
  cert.publicKey = csr.publicKey;
  
  cert.setExtensions([
    { name: 'basicConstraints', cA: false },
    { name: 'keyUsage', digitalSignature: true, keyEncipherment: true },
    { name: 'extKeyUsage', serverAuth: true, clientAuth: true },
  ]);
  
  cert.sign(caPrivateKey, forge.md.sha256.create());

  return forge.pki.certificateToPem(cert);
}

export function generateCSR(commonName) {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const csr = forge.pki.createCertificationRequest();
  csr.publicKey = keys.publicKey;
  csr.setSubject([
    {
      name: 'commonName',
      value: commonName,
    },
  ]);
  csr.sign(keys.privateKey);
  const csrPem = forge.pki.certificationRequestToPem(csr);
  return { privateKey: keys.privateKey, csrPem };
}
