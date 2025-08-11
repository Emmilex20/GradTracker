// routes/programRoutes.js
import express from 'express';
import Airtable from 'airtable';
const router = express.Router();

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const table = base('Graduate Programs');

// GET all programs
router.get('/', async (req, res) => {
    try {
        const records = await table.select({ view: "Grid view" }).all();
        const programs = records.map(record => ({
            id: record.id,
            university: record.fields['University'],
            department: record.fields['Department'],
            funding: record.fields['Funding'],
            fundingAmount: record.fields['Funding Amount'] || 'N/A',
            deadline: record.fields['Application Deadline'] || 'N/A',
            greWaiver: record.fields['GRE Waiver'],
            ieltsWaiver: record.fields['IELTS Waiver'],
            appFeeWaiver: record.fields['Application Fee Waiver'],
            requiredDocs: record.fields['Required Documents'],
            appLink: record.fields['Application Link']
        }));
        res.json(programs);
    } catch (error) {
        console.error("Airtable API error:", error);
        res.status(500).json({ message: "Failed to fetch programs." });
    }
});

// GET programs based on a search query
router.get('/search', async (req, res) => {
    const { query } = req.query;
    
    if (!query) {
        return res.status(400).json({ message: "Search query is required." });
    }

    try {
        const records = await table.select({
            filterByFormula: `OR(FIND(LOWER("${query}"), LOWER({University})), FIND(LOWER("${query}"), LOWER({Department})))`,
            maxRecords: 10,
        }).all();
        
        const programs = records.map(record => ({
            id: record.id,
            university: record.fields['University'],
            department: record.fields['Department'],
            funding: record.fields['Funding'],
            fundingAmount: record.fields['Funding Amount'] || 'N/A', 
            applicationDeadline: record.fields['Application Deadline'] || 'N/A', 
            greWaiver: record.fields['GRE Waiver'],
            ieltsWaiver: record.fields['IELTS Waiver'],
            appFeeWaiver: record.fields['Application Fee Waiver'],
            requiredDocs: record.fields['Required Documents'],
            appLink: record.fields['Application Link'] // Corrected field name
        }));

        res.json(programs);
    } catch (error) {
        console.error("Airtable API error:", error);
        res.status(500).json({ message: "Failed to search programs." });
    }
});

export default router;