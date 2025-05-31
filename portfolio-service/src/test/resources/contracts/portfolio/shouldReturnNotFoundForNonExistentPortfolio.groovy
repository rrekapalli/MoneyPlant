package contracts.portfolio

import org.springframework.cloud.contract.spec.Contract

Contract.make {
    description "should return 404 Not Found for a non-existent portfolio"
    
    request {
        method GET()
        url "/api/v1/portfolio/non-existent-id"
    }
    
    response {
        status NOT_FOUND()
    }
}