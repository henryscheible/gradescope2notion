// Initialize butotn with users's prefered color
let execute = document.getElementById("execute");

// When the button is clicked, inject setPageBackgroundColor into current page
execute.addEventListener("click", async () => {
  let result = document.getElementById("result");
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  let out = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: importToNotion,
  });
  result.innerHTML = out[0].result.name;
  await addItem(out[0].result.name, "test course", out[0].result.dueDate);
  console.log(out);
});

// The body of this function will be executed as a content script inside the
// current page
function importToNotion() {
  let name = document.querySelector("tbody>tr").querySelector("th>button").innerHTML
  let dueDate = document.querySelector("tbody>tr").querySelector("td>div>div>span.submissionTimeChart--dueDate").innerHTML
  console.log({name: name, dueDate: dueDate});
  return {name: name, dueDate: dueDate};
}

import { Client } from "@notionhq/client"

const notion = new Client({ auth: process.env.NOTION_KEY })

const databaseId = process.env.NOTION_DATABASE_ID

async function addItem(text, course, due_date) {
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        "Name": {
          title:[
            {
              "text": {
                "content": text
              }
            }
          ]
        },
        "Class": {
          "select": {
            "name": course
          }
        },
        "Status": {
          "status": {
            "name": "Not started"
          }
        },
        "Due Date": {
          "date": {
            "start": due_date.substring(0, 10)
          }
        }
      },
    })
    console.log(response)
    console.log("Success! Entry added.")
  } catch (error) {
    console.error(error.body)
  }
}
