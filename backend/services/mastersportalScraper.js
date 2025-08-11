import { chromium } from 'playwright';
import Program from '../models/Program.js';

const scrapeMastersportal = async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    let scrapedProgramsCount = 0;

    try {
        console.log('Starting Mastersportal scraping...');
        const url = 'https://www.mastersportal.com/search/scholarships/master/united-states';
        
        // Wait for the page to load all content and stop making network requests
        await page.goto(url, { waitUntil: 'networkidle' });

        while (true) {
            // This is the correct, specific selector for the main scholarship card
            const programCardSelector = 'a.ScholarshipCard'; 
            
            try {
                // Wait for at least one card to appear on the page.
                await page.locator(programCardSelector).first().waitFor({ timeout: 60000 });
                console.log('Program cards loaded successfully.');
            } catch (waitError) {
                console.log('No more program cards found or timeout exceeded. Exiting pagination loop.');
                break;
            }

            const programsOnPage = await page.evaluate((selector) => {
                const programList = [];
                const programElements = document.querySelectorAll(selector);

                programElements.forEach(element => {
                    const schoolName = element.querySelector('.ProviderDetails .Name')?.innerText.trim();
                    const programName = element.querySelector('.ScholarshipName')?.innerText.trim();
                    const deadlineText = element.querySelector('.ScholarshipCardQuickFacts > div:nth-child(2) .QFValue')?.innerText.trim();
                    
                    let deadline = null;
                    if (deadlineText && deadlineText !== 'Not specified' && deadlineText !== 'Anytime') {
                        deadline = new Date(deadlineText);
                    }

                    if (schoolName && programName) {
                        programList.push({ schoolName, programName, deadline, source: 'Mastersportal' });
                    }
                });

                return programList;
            }, programCardSelector);

            // Save the scraped programs to the database
            for (const programData of programsOnPage) {
                await Program.findOneAndUpdate(
                    { schoolName: programData.schoolName, programName: programData.programName },
                    programData,
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                scrapedProgramsCount++;
            }

            console.log(`Scraped and saved ${programsOnPage.length} programs from the current page.`);

            // Check for the "next page" button
            const nextButton = await page.$('a.next-page-btn');
            if (nextButton && !(await nextButton.isDisabled())) {
                await nextButton.click();
                await page.waitForNavigation();
            } else {
                break;
            }
        }

        console.log(`Successfully scraped a total of ${scrapedProgramsCount} programs.`);
    } catch (error) {
        console.error('Mastersportal scraping failed:', error);
    } finally {
        await browser.close();
    }
};

export default scrapeMastersportal;