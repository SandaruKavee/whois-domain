const fs = require('fs');
const path = require('path');
const readline = require('readline');
const directoryPath = path.join(__dirname, "../user_files");
exports.getAll = async (req, res) => {
     // Change to your folder path

    try {
        const files = await fs.promises.readdir(directoryPath);

        // Batched processing to limit concurrency
        const batchSize = 10; // Process 10 files at a time
        let parsedData = [];

        // Process files in batches
        for (let i = 0; i < files.length; i += batchSize) {
            const batchFiles = files.slice(i, i + batchSize);
            const batchPromises = batchFiles.map(async (file) => {
                const filePath = path.join(directoryPath, file);
                const content = await readFileStream(filePath); // Read file stream

                const parsedFile = parseContent(content, file); // Parsing logic
                parsedData.push(parsedFile);
            });

            // Wait for the current batch to finish before moving to the next one
            await Promise.all(batchPromises);
        }

        res.json({ files: parsedData });

    } catch (err) {
        res.status(500).json({ error: "Unable to read files", details: err.message });
    }
};

// Function to read file using stream
const readFileStream = (filePath) => {
    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(filePath, 'utf8');
        let content = '';

        readStream.on('data', chunk => {
            content += chunk; // Accumulate file content
        });

        readStream.on('end', () => {
            resolve(content); // Return file content once finished
        });

        readStream.on('error', (err) => {
            reject(err); // Handle errors
        });
    });
};

// Parsing function (existing logic)
const parseContent = (content, filename) => {
  const patterns = {
    domain_name: /Domain Name:\s*(.+)/i,
    registrar: /Registrar:\s*([\s\S]+?)(?=\n{2,}|\n[A-Z])/i,  // Fix applied here
    updated_date: /Updated Date:\s*(.+)/i,
    creation_date: /Creation Date:\s*(.+)/i,
    status: /Status:\s*(.+)/i
};

    const extractData = (pattern, text) => {
        const match = text.match(pattern);
        return match ? match[1].trim().replace(/\r?\n\s*/g, " ") : "";  // Return "N/A" if not found
    };

    return {
        filename,
        domain_name: extractData(patterns.domain_name, content),
        registrar: extractData(patterns.registrar, content),
        updated_date: extractData(patterns.updated_date, content),
        creation_date: extractData(patterns.creation_date, content),
        status: extractData(patterns.status, content)
    };
};


exports.getDomainInfo = async(req, res) => {
    const domain_name = req.query.domain_name; 
    if (!domain_name) {
        return res.status(400).json({ error: "Domain name is required" });
    }

    try {
        const files = await fs.readdirSync(directoryPath);

        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            const content =await fs.readFileSync(filePath, "utf8");

            const domainRegex = new RegExp(`Domain Name:\\s*${domain_name}`, "i");
            if (domainRegex.test(content)) {
                // Extract status and creation date
                const statusMatch = content.match(/Status:\s*(.+)/i);
                const creationDateMatch = content.match(/Creation Date:\s*(.+)/i);

                return res.json({
                    domain_name: domain_name,
                    status: statusMatch ? statusMatch[1].trim() : "Unknown",
                    creation_date: creationDateMatch ? creationDateMatch[1].trim() : "Unknown"
                });
            }
        }

        res.status(404).json({ error: "Domain not found" });
    } catch (error) {
        res.status(500).json({ error: "Error reading files", details: error.message });
    }
};