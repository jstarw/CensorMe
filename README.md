# CensorMe
#####Censors out unwanted pictures and text using HPE Haven API. Built during AngelHack Toronto 2016

CHROME EXTENSION
- allows users to add concepts or words to filter out
- Sends entire webpage to Node server
- if Node responds with words to be filtered out, then block out the text

NODE SERVER
- receives the request from the chrome extension
- uses HPE Haven text extraction, sentiment analysis 
- parses web document and determinees if words need to be censored
- sends response data to front end
- possibly store data in Redis server for future analysis
