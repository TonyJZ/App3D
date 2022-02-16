App3D
============

This repo contains the source code for the "App3D" library, which is a custom wrapper library built on the open-source **three.js** library (link: https://github.com/mrdoob/three.js/). The App3D library can be included in frontend projects to build custom 3D applications.

Individual features of the App3D library can be seen / demonstrated in the unit test files included at <repo>/tutorials. Details on how to run these unit test demos are included below.

-----------

# Building The App3D Library:

### Step 1: Install npm, rollup (if not already installed):

`sudo apt-get install -y npm`
`sudo npm i rollup -g`

### Step 2: Build the library:

`cd <repo>`

Then, you can either perform the build once:

`rollup -c`

...or perform the build automatically each time relevant code files change (better for during development):

`rollup -c --watch`

-----------

# Deployment Steps:

"Deploying" the App3D library consists of running additional cleanup / build tasks on the App3D source code, then copying it to the "App 3D Server" repository for all applications there to use. The App 3D Server is located here: https://sh_git.appropolis.com.cn/appropolis/front/App3dServer

### Step 1: Install npm, ESLint (if not already installed):

`sudo apt-get install -y npm`
`sudo npm i eslint -g`

### Step 2: Run ESLint:

```
cd <repo>
eslint --fix .
```

This will automatically enforce a bare minimum of our coding standards on the source code (e.g.: adding semicolons, white spaces, indentation, etc.).

### Step 3: Install babel, babel presets, and js-obfuscate plugins for rollup (if not installed already):

```
npm i -D rollup-plugin-babel@3
npm i -D babel-preset-env babel-plugin-external-helpers
npm i -D javascript-obfuscator 
# in windows, use this command (npm install --save-dev rollup-plugin-javascript-obfuscator)
```

### Step 4: Build the final rolled up App3D library file with the above plugins:

`rollup -c rollupBabelAndUglify.config.js`

Note that this more complicated rollup can take **30 seconds or more** to complete.

### Step 5: Copy the newly-built "app3d.js" file to <app3dServer>/libs/app3d, replacing the file that's already there

### Step 6: (In the app3dServer repo:) Commit your changes to the repo and push them to remote

-----------

# Run tutorials:

### Step 1: Build the App3D library (see above steps)

### Step 2: Start python server:

```
cd tutorials/pythonServer
python3 cors_server.py [port]
```

### Step 3: Open internet browser and go to `http://localhost:7999/tutorials`

### Step 4: Click on any unit test HTML file beginning with "tutorial_"


-----------

# Other Modes:

### Rollup App3D with only Babel ES5 transpilation:

If for whatever reason you only wish to perform the Babel transpilation (and not the Uglify), then instead of the above steps, run:

`rollup -c rollupBabel.config.js`

-----------

# Other Information:

### File and directory descriptions

* **<repo>/build/app3d.js :** Output file
* **<repo>/tutorials :** Various tutorial files
* **<repo>/src :** Source code
* **<repo>/thirdParty :** Third party libraries

### Developer coding guidelines:

See the file coding-guidelines.txt

### Format for commit messages to master branch:

App3D v xx.yy
==========
1. [Added] Feature description
2. [Updated] Feature description
3. [Fixed] Bug description
4. [Removed] Feature description

### User guidelines:
* filename extension description
```
".app1" =  ".dae"
".app2" =  ".glb"
".app3" =  ".gltf"
".app4" =  ".fbx"
".app5" =  ".json"
```