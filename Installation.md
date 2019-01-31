The Following package contains the frontend for the invision goat-3d-product configurator.
As well as a small API to upload images and
 supply webcrawler routes for opengraph(facebook, e.g.) and  twitter cards.
  

Follow the installation instructions below if you want to install this software package.  
   
# Installation   

Notes:
* Depending on the settings in the file "server/config.js" a upload folder will be generated for you that stores the GIF images whenever a user shares his content.
ans in apache
    * For the file upload to work the server might have to be set to a higher file size limit. 
    * e.g. nginx ````client_max_body_size 20M;````   
      
* Twitter sharing requires the service to run transparently under port 80, otherwise the twitter crawler will trow a HTTPConnectionTimeout and the cards wont't be rendered as they should.
    * one way to achieve this is to use vhosts / proxy_pass settings in nginx or similar means
    

## Dependencies
* git
* npm
* apt-get

  
 
## Step 1
* on the server, navigate to your desired installation directory. Default for the project is:

````
cd /usr/share/nginx/html/goat-dev 
````


## Step 2
* you now have different options to start the application
### Option 1 (testing) 
* following commands will start server including (use your github login credentials when asked)
````
rm gun-customizer -r &&
git clone https://github.com/SymboInteractive/gun-customizer.git --branch develop --single-branch &&
cd gun-customizer &&
npm install &&
npm run-script build &&
cd server &&
npm install &&
npm run-script start
````

### Option 2 (testing)

* this will start the pure file server without the gif upload and node server
````
rm gun-customizer -r &&
git clone https://github.com/SymboInteractive/gun-customizer.git --branch develop --single-branch &&
cd gun-customizer &&
npm install &&
npm run-script build &&
cd dist/gun-customizer &&
http-server -p 8081
````

### Option 3 (production)

* make sure supervisor is installed or use:
````
apt-get install supervisor
````

* install the application like with option 1 or 2 
````
rm gun-customizer -r &&
git clone https://github.com/SymboInteractive/gun-customizer.git --branch develop --single-branch &&
cd gun-customizer &&
npm install &&
npm run-script build &&
cd server &&
npm install

````

* run the application as a service
    * TODO this mightnot work that way currently
    * "supervisord" might still be running and nto the service itself
    *  alias kill3000="fuser -k -n tcp 3000"

````
cd /usr/share/nginx/html/goat-dev/gun-customizer/server/ &&
cp /usr/share/nginx/html/goat-dev/gun-customizer/server/supervisord.conf /etc/supervisor/conf.d/goat.conf

service supervisor restart

````

   
# testing
* localtunnel can be used to test features like facebook/twitter sharing
````
npm install -g localtunnel
````
* lt -p \<port> --subdomain \<subdomain>
````
lt -p 3000 --subdomain mighty-starfish-59
````




#"Backlog"
## potential improvements
* visual feedback on hover (e.g. wireframe )
    * partially implemented
* persistent uploads directory like volumes  
    * docker for persistency of data?                       
       
                    
## TODO 
** Ok, talked with my friend at FB, apparently they have updated they algorithms and blocked lots of weapon related content today. One thing we can do is to remove all text with the word”GUN” in it, to avoid been blocked. Let’s try that when you have time, and see if that works. Thanks

* invision3d.org is deemed bad on fb
* test via tunnel until facebook scraper finds what it needs...
    * https://developers.facebook.com/tools/debug/og/object/
* ???
    * maybe twitter needs secure https like in the docs
    * facebook secure_url https.. same goes here .. might be necessary for auto play 
    * but still card validator does not work
    * FB - app might not be in production mode but why would that matter?    
    
* socketio not working on server as nginx is not configured right
* uploadTar route not working on server ..

* closing share modal has become bugged ...

* notes
    * Weapon offset position after the Sharing feature o Same issue been mentioned before,
  when the sharing feature completed or been canceled, 
  can we set the weapons back to the default pose? 
    * Adjust turntable camera angle o The stake holder prefers this angle instead (see doc)
 

* use clients facebook api key

* preview 
    * second mesh has different rotation 
    * add custom starting positions?

* GIF export: test file size based on materials and patterns used
    * also viewing angle impacts file size
    * and artifacts

* how to handle no longer available content?
    * currently page links to files anyway
                  
* delete file if user aborts sharing

* save file for mobile users
    * we should be able to have it saved in Pictures/Photos       
    
* update tests and documentation    
    
## done

* have a quick file upload api to send the gifs and then to create random html files that deliver 
* undo manager bug (preview interfered with picking)
    * after share is initialized the mesh cant be edited anymore

* <b>twitter and facebook</b> 
    * fb animate in timeline, on link click open website origin
    * twitter share multiple links 
        * first GIF url directly that should be rendered
        * second one origin
        * can't test upload via tunnel (413 too large)
        * can't test on server as twitter crawler gets HTTPConnectionTimeout (from custom port?)    
    * potential alternative if above is not working for twitter
        * https://twittercommunity.com/t/bug-twitter-cards-error-failed-to-fetch-page-due-to-httpconnectiontimeout/86659
        * http://travaux.ovh.net/?do=details&id=24590        

*  So can we polish the turn table, meaning change BG to black,
    * add VFX and make it looks cool and update all the changes 
    to the server so we can test out everything? 
    Or you’d prefer wait till the Twitter sharing fixed to do that?    