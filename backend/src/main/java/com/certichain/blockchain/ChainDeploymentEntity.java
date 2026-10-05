package com.certichain.blockchain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "chain_deployment")
public class ChainDeploymentEntity {

    @Id
    private Integer id;

    @Column(name = "contract_address", nullable = false)
    private String contractAddress;

    @Column(name = "chain_id", nullable = false)
    private long chainId;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getContractAddress() {
        return contractAddress;
    }

    public void setContractAddress(String contractAddress) {
        this.contractAddress = contractAddress;
    }

    public long getChainId() {
        return chainId;
    }

    public void setChainId(long chainId) {
        this.chainId = chainId;
    }
}
