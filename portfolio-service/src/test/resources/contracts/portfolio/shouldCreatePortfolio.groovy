package contracts.portfolio

import org.springframework.cloud.contract.spec.Contract

Contract.make {
    description "should create a portfolio"
    
    request {
        method POST()
        url "/api/v1/portfolio"
        headers {
            contentType applicationJson()
        }
        body(
            name: "Test Portfolio",
            description: "Test Description"
        )
    }
    
    response {
        status CREATED()
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