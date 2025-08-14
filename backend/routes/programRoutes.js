// routes/programRoutes.js

import express from 'express';
import Airtable from 'airtable';
const router = express.Router();

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const table = base('Graduate Programs');

// GET all programs and filter based on search and funding query parameters
router.get('/', async (req, res) => {
    try {
        const { search, funding } = req.query; // Extract search and funding queries
        
        let filterFormula = '';
        const conditions = [];

        if (search) {
            // Case-insensitive search on University and Department
            conditions.push(`OR(FIND(LOWER("${search}"), LOWER({University})), FIND(LOWER("${search}"), LOWER({Department})))`);
        }

        if (funding) {
            conditions.push(`{Funding} = "${funding}"`);
        }

        if (conditions.length > 0) {
            filterFormula = `AND(${conditions.join(', ')})`;
        }

        const queryOptions = {
            view: "Grid view"
        };

        if (filterFormula) {
            queryOptions.filterByFormula = filterFormula;
        }

        const records = await table.select(queryOptions).all();

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

// Remove the old /search route since the main '/' route will handle everything
// router.get('/search', ... ); 

export default router;