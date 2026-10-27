// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract CertificateRegistry {
    struct Certificate {
        string id;
        string recipientName;
        string courseName;
        string certificateHash;
        string metadataJson;
        uint256 issueDate;
        address issuer;
        bool isValid;
    }

    address public owner;
    mapping(string => Certificate) private certificates;
    string[] private certificateIds;

    event CertificateIssued(
        string indexed id,
        string recipientName,
        string courseName,
        string certificateHash,
        address indexed issuer,
        uint256 issueDate
    );

    event CertificateRevoked(string indexed id, address indexed revokedBy);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only registry admin can perform this");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function issueCertificate(
        string memory _id,
        string memory _recipientName,
        string memory _courseName,
        string memory _certificateHash,
        string memory _metadataJson
    ) public {
        require(bytes(_id).length > 0, "Certificate ID cannot be empty");
        require(bytes(_recipientName).length > 0, "Recipient name cannot be empty");
        require(bytes(_courseName).length > 0, "Course name cannot be empty");
        require(certificates[_id].issueDate == 0, "Certificate with this ID already exists");

        certificates[_id] = Certificate({
            id: _id,
            recipientName: _recipientName,
            courseName: _courseName,
            certificateHash: _certificateHash,
            metadataJson: _metadataJson,
            issueDate: block.timestamp,
            issuer: msg.sender,
            isValid: true
        });

        certificateIds.push(_id);

        emit CertificateIssued(
            _id,
            _recipientName,
            _courseName,
            _certificateHash,
            msg.sender,
            block.timestamp
        );
    }

    function verifyCertificate(string memory _id) public view returns (
        bool exists,
        string memory id,
        string memory recipientName,
        string memory courseName,
        string memory certificateHash,
        string memory metadataJson,
        uint256 issueDate,
        address issuer,
        bool isValid
    ) {
        Certificate memory cert = certificates[_id];
        if (cert.issueDate == 0) {
            return (false, "", "", "", "", "", 0, address(0), false);
        }
        return (
            true,
            cert.id,
            cert.recipientName,
            cert.courseName,
            cert.certificateHash,
            cert.metadataJson,
            cert.issueDate,
            cert.issuer,
            cert.isValid
        );
    }

    function revokeCertificate(string memory _id) public {
        Certificate storage cert = certificates[_id];
        require(cert.issueDate > 0, "Certificate does not exist");
        require(msg.sender == cert.issuer || msg.sender == owner, "Not authorized to revoke");
        require(cert.isValid, "Certificate already revoked");

        cert.isValid = false;
        emit CertificateRevoked(_id, msg.sender);
    }

    function getCertificateCount() public view returns (uint256) {
        return certificateIds.length;
    }

    function getAllCertificates() public view returns (Certificate[] memory) {
        uint256 count = certificateIds.length;
        Certificate[] memory allCerts = new Certificate[](count);
        for (uint256 i = 0; i < count; i++) {
            allCerts[i] = certificates[certificateIds[i]];
        }
        return allCerts;
    }
}
