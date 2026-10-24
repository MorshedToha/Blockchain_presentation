import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import { ed25519 } from '@noble/curves/ed25519.js';

const bytes = (value: string) => new TextEncoder().encode(value);

export const hash = (value: string) => bytesToHex(sha256(bytes(value)));
export const shortHash = (value: string) => value.slice(0, 8).toUpperCase();
export const firstRecord = (amount: string) => JSON.stringify({ previous: 'classroom-genesis', from: 'Alex', to: 'Sam', tokens: amount });
export const originalHash = hash(firstRecord('7'));
export const secondHash = hash(JSON.stringify({ previous: originalHash, from: 'Sam', to: 'Jo', tokens: '2' }));
export const thirdHash = hash(JSON.stringify({ previous: secondHash, from: 'Jo', to: 'Lee', tokens: '1' }));

// This public, deterministic teaching key is never suitable for real credentials or funds.
const teachingKey = sha256(bytes('BLOCKCHAIN CLASSROOM DEMO - PUBLIC TEST KEY - NOT FOR REAL USE'));
const issuerPublicKey = ed25519.getPublicKey(teachingKey);
const credential = (name: string) => bytes(JSON.stringify({ issuer: 'Classroom Academy', name, course: 'Blockchain basics', date: '2025-05-01' }));
const signature = ed25519.sign(credential('Alex Morgan'), teachingKey);

export const verifyCredential = (name: string) => ed25519.verify(signature, credential(name), issuerPublicKey);
export const signaturePreview = bytesToHex(signature).slice(0, 20).toUpperCase();