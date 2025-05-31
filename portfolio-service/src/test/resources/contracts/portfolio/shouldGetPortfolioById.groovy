package contracts.portfolio

import org.springframework.cloud.contract.spec.Contract

Contract.make {
    description "should get a portfolio by ID"
    
    request {
        method GET()
        url "/api/v1/portfolio/test-id"
    }
    
    response {
        status OK()
        headers {
            contentType applicationJson()
        }
        body(
            id: "test-id",
            name: "Test Portfolio",
            description: "Test Description"
        )
    }
}