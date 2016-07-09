# CensorMe
#####Censors out unwanted concepts and text using HPE Haven API. Built during AngelHack Toronto 2016

CHROME EXTENSION
- Allows users to add concepts or words to filter out
- Sends entire webpage to Node server
- If Node responds with words to be filtered out, then block out the text

NODE SERVER
- Receives the request from the chrome extension
- Uses HPE Haven text extraction, sentiment analysis 
- Parses web document and determinees if words need to be censored
- Uses cortical API to do a semantic comparison of the user filtered concepts with the concepts found on the page
- Sends response data to front end
- Possibly store data in Redis server for future analysis

CHALLENGES FACED
- Achieving semantic comparison with text was very difficult because of the lack of resources available. The most popular option was to use wordnet to calculate the similarity, however because we were using javascript in the backend there was no exisiting method to do so. We decided to research possible APIs that could be used and found Cortical API.  
