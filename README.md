# YoutubeVideoAnalyzer

Youtube audio analyzer tool is a web app that takes an input Youtube URL and a phrase as input and spits useful statistics about the video, namely:

- Phrase search: Timestamps in which the input phrase occured on a video
- Profanities: Detected profanities in the video with their corresponding timestamps
- Word statistics: The ordered table of words, ordered based on the number of times the word occured on a video. Stop words such as 'I', 'me', 'do' are filtered out of the statistics.
- Matching videos: Everytime someone uses our tool, the output statistics of a video is saved in our database. We check these existing database records to output Youtube URLs in which the phrase was detected.
