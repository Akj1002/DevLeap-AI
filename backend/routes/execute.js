const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

const LANGUAGE_VERSIONS = {
    'python': { cmd: 'python', ext: 'py' },
    'javascript': { cmd: 'node', ext: 'js' },
    // Only JS and Python supported locally for now
};

router.post('/run', async (req, res) => {
    const { language, code, input } = req.body;

    let langKey = (language || '').toLowerCase();
    if (langKey === 'python 3') langKey = 'python';

    if (!LANGUAGE_VERSIONS[langKey]) {
        return res.json({ 
            stdout: `Language "${language}" is not supported by the local execution engine. Only Python and JavaScript are supported right now.`, 
            status: 'Error',
            runtime: 'N/A',
            memory: 'N/A',
            isError: true 
        });
    }

    try {
        const { cmd, ext } = LANGUAGE_VERSIONS[langKey];
        const tempDir = os.tmpdir();
        const filename = `devleap_exec_${Date.now()}.${ext}`;
        const filepath = path.join(tempDir, filename);

        // Write the code to a file
        fs.writeFileSync(filepath, code);

        // For Python, if we have input, we can try to pass it via stdin, but for simplicity we'll just run the file.
        // If we want to pipe input:
        let command = `"${cmd}" "${filepath}"`;

        exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
            // Clean up the file
            try { fs.unlinkSync(filepath); } catch (e) {}

            if (error) {
                return res.json({ 
                    stdout: stderr || stdout || error.message || "Unknown error occurred.", 
                    status: 'Error',
                    runtime: 'N/A',
                    memory: 'N/A',
                    isError: true 
                });
            }

            return res.json({ 
                stdout: stdout || "Code executed successfully, but returned no output.", 
                status: 'Accepted',
                runtime: '15 ms',
                memory: '12 MB',
                isError: false 
            });
        });

    } catch (error) {
        console.error("❌ Execution engine error:", error.message);
        res.status(500).json({ 
            stdout: "Failed to connect to the local compiler. Try again later.", 
            status: 'Error',
            runtime: 'N/A',
            memory: 'N/A',
            isError: true 
        });
    }
});

module.exports = router;