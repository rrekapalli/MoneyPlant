package contracts.portfolio

import org.springframework.cloud.contract.spec.Contract

Contract.make {
    description "should get all portfolios"
    
    request {
        method GET()
        url "/api/v1/portfolio"
    }
    
    response {
        status OK()
        headers {
            contentType applicationJson()
        }
        body([
            [
                id: "test-id",
                name: "Test Portfolio",
                description: "Test Description"
            ]
        ])
    }
}