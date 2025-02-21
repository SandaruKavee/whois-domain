const axios = require("axios");
const path = require("path");
const fs = require("fs");
const API_URL = "http://localhost:3000/domains/all"; 
const TOTAL_REQUESTS = 300000; //this will run 100000 times per each domain 

const RESULT_FILE = path.join(__dirname, "testResult.txt");
jest.setTimeout(1200000); // Set timeout to 20 minutes

describe("API Performance Test", () => {
    test(`Measure average response time over ${TOTAL_REQUESTS} sequential requests`, async () => {
        let totalTime = 0;
        let requestTimes = [];

        for (let i = 0; i < TOTAL_REQUESTS; i++) {
            const startTime = Date.now();
            await axios.get(API_URL);
            const endTime = Date.now();

            const responseTime = endTime - startTime;
            totalTime += responseTime;
            requestTimes.push(responseTime);
        }

        // Calculate average response time
        const averageTime = totalTime / TOTAL_REQUESTS;
        const resultText = `\nTotal Requests: ${TOTAL_REQUESTS}\nAverage Response Time: ${averageTime.toFixed(2)} ms\n`;

        // Write to file
        fs.writeFileSync(RESULT_FILE, resultText, "utf8");

        console.log(`\nTest results saved to ${RESULT_FILE}`);
        console.log(resultText);

        // Expect API response time to be under 500ms
        expect(averageTime).toBeLessThan(500);
    });
});
