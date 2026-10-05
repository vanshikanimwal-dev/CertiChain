// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// Deployed by the API to the local chain, or to Sepolia when a wallet and RPC are configured.
contract CertificateRegistry {
    address public owner;

    struct Record {
        bytes32 certificateHash;
        uint64 timestamp;
        bool revoked;
        bool exists;
    }

    mapping(string => Record) private records;

    error NotOwner();
    error AlreadyRegistered();
    error MissingCertificate();

    event CertificateRegistered(string certificateId, bytes32 certificateHash);
    event CertificateRevoked(string certificateId);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerCertificate(string calldata certificateId, bytes32 certificateHash) external onlyOwner {
        if (records[certificateId].exists) revert AlreadyRegistered();
        records[certificateId] = Record(certificateHash, uint64(block.timestamp), false, true);
        emit CertificateRegistered(certificateId, certificateHash);
    }

    function revokeCertificate(string calldata certificateId) external onlyOwner {
        if (!records[certificateId].exists) revert MissingCertificate();
        records[certificateId].revoked = true;
        emit CertificateRevoked(certificateId);
    }

    function verifyCertificate(string calldata certificateId, bytes32 certificateHash)
        external
        view
        returns (bool matches, bool revoked, bool exists)
    {
        Record memory record = records[certificateId];
        return (record.exists && record.certificateHash == certificateHash, record.revoked, record.exists);
    }
}
