package com.certichain.blockchain;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ChainDeploymentRepository extends JpaRepository<ChainDeploymentEntity, Integer> {
}
