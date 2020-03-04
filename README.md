# laughing-chainsaw
3/3/2020
My discord bot. It is currently using a flat file index.js and an attempt was made at using a mongo db to hold category entries, but for some reason my db purged its data and I realized that with no redundancy, this wouldn't be useful longterm. So I'm going to get all the functionality of indexwithmongov3 into index.js and purge mongo entries. then I'm going to use lessons learned from mongo to move to firestore/firebase with the Move to firestore v1 entry.

3/4/2020

# Bot setup instructions
1. In terminal, navigate to root directory and run npm install
2. Follow steps 2-4 here: https://www.digitaltrends.com/gaming/how-to-make-a-discord-bot
3. With the token you generated from those previous instructions: create a file named config.json in the root directory. It only needs this content:
{
	"token": "$yourbotstoken"
}
4. Once that's saved your bot should be able to connect to discord. In terminal run the command node index.js


# Firestore DB Setup instructions?

1. Create a firebase project
2. In that firebase project, click database and follow setup wizard.
3. On the gear to the right of "project overview" click users and permissions
4. Click the service accounts link
5. Since this was setup in npm, and I'm assuming you ran npm install already:
6. Click firebase admin sdk
7. Click node.js radio button
8. Click generate new private key.
9. Take that private key, and rename it: serviceAccountKey.json
10. move it to the root of the project directory
