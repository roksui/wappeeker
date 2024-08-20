import puppeteer from 'puppeteer';
import { readFileSync } from 'fs';

const technologies = JSON.parse(readFileSync(new URL("./technologies/index.json", import.meta.url), "utf-8"));

const techToTestables = Object.keys(technologies).map(key => (
  { 
    tech: key, 
    testables: { 
      scripts: technologies[key]["js"] ? Object.keys(technologies[key]["js"]) : null, 
      cookies: technologies[key]["cookies"] ? Object.keys(technologies[key]["cookies"]) : null
    }
  }
));

export const detectedTechs = new Set();

export const scan = async (url) => {
  const browser = await puppeteer.launch({
    acceptInsecureCerts: true,
  });

  const page = await browser.newPage();

  await page.goto(url);
  const scriptExecutions = [];
  const cookieChecks = [];

  techToTestables.forEach(({ tech, testables }) => {
    const { scripts, cookies } = testables;

    if (scripts) {
      scripts.forEach(script => {
        const scriptExecution = async (script) => {
          const result = await page.evaluate((script) => { try { return eval(script); } catch { } }, script);
          if (result !== undefined && result) {
            detectedTechs.add(tech);
          }
        }
        scriptExecutions.push(scriptExecution(script));
      });
    }

    if (cookies) {
      const cookieCheck = async (cookies) => {
        const cookiesFromPage = await page.cookies();
        cookiesFromPage.forEach(cookie => {
          if (cookies.includes(cookie.name.toLowerCase())) {
            detectedTechs.add(tech);
          }
        });
      };
      cookieChecks.push(cookieCheck(cookies.map(cookie => cookie.toLowerCase())));
    }
  });

  await Promise.all(scriptExecutions).then(async () => {
    console.log("Finished executing all scripts.");
  });
  await Promise.all(cookieChecks).then(async () => {
    console.log("Finished checking cookies.");
    await browser.close();
  });
}