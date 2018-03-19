library identifier: 'devops-library@master', retriever: modernSCM(
  [$class: 'GitSCMSource',
   remote: 'https://github.com/BCDevOps/jenkins-pipeline-shared-lib.git'])

// Edit your app's name below
def APP_NAME = 'esm-server'
def APP_NAME_URL = 'esm' // this is necessary until we consolidate the naming conventions in OpenShift
// Edit your environment TAG names below
def TAG_NAMES = [
  'test', 
  'prod'
]
def APP_URLS = [
  "https://${APP_NAME_URL}-${TAG_NAMES[0]}.${env.PATHFINDER_URL}",
  "https://${APP_NAME_URL}-${TAG_NAMES[1]}.${env.PATHFINDER_PROD_URL}"
]

// You shouldn't have to edit these if you're following the conventions
def ARTIFACT_BUILD = APP_NAME + '-build'
def IMAGESTREAM_NAME = APP_NAME
def CHANGE_STRING = null

def hasRepoChanged = false;
node{
  def lastCommit = getLastCommit()
  if(lastCommit != null){
    // Ensure our CHANGE variables are set
    if(env.CHANGE_AUTHOR_DISPLAY_NAME == null){
      env.CHANGE_AUTHOR_DISPLAY_NAME = lastCommit.author.fullName
    }

    if(env.CHANGE_TITLE == null){
      env.CHANGE_TITLE = lastCommit.msg
    }

    if(CHANGE_STRING == null){
      CHANGE_STRING = getChangeString()
    }

    hasRepoChanged = true;
  }else{
    hasRepoChanged = false;
  }
}

if(hasRepoChanged){
  stage('Build ' + APP_NAME) {
    node{
      try{
        echo "Building: " + ARTIFACT_BUILD
        openshiftBuild bldCfg: ARTIFACT_BUILD, showBuildLogs: 'true'
        
        // Don't tag with BUILD_ID so the pruner can do it's job; it won't delete tagged images.
        // Tag the images for deployment based on the image's hash
        IMAGE_HASH = sh (
          script: """oc get istag ${IMAGESTREAM_NAME}:latest -o template --template=\"{{.image.dockerImageReference}}\"|awk -F \":\" \'{print \$3}\'""",
          returnStdout: true).trim()
        echo ">> IMAGE_HASH: ${IMAGE_HASH}"
      }catch(error){
        slackNotify(
          'Build Broken 🤕',
          "The latest ${APP_NAME} build seems to have broken\n'${error.message}'",
          'danger',
          env.SLACK_HOOK,
          env.SLACK_QA_CHANNEL,
          [
            [
              type: "button",
              text: "View Build Logs",
              style:"danger",           
              url: "${currentBuild.absoluteUrl}/console"
            ]
          ])
        throw error
      }
    }
  }

  stage('Deploy ' + TAG_NAMES[0]) {
    def environment = TAG_NAMES[0]
    def url = APP_URLS[0]
    node{
      try{
        openshiftTag destStream: IMAGESTREAM_NAME, verbose: 'true', destTag: environment, srcStream: IMAGESTREAM_NAME, srcTag: "${IMAGE_HASH}"
        slackNotify(
            "New Version in ${environment} 🚀",
            "A new version of the ${APP_NAME} is now in ${environment}.\n Changes: ${CHANGE_STRING}",
            'good',
            env.SLACK_HOOK,
            env.SLACK_QA_CHANNEL,
            [
              [
                type: "button",
                text: "View New Version",         
                url: "${url}"
              ],
              [
                type: "button",            
                text: "Deploy to Test?",
                style: "primary",              
                url: "${currentBuild.absoluteUrl}/input"
              ]
            ])
      }catch(error){
        slackNotify(
          "Couldn't deploy to ${environment} 🤕",
          "The latest deployment of the ${APP_NAME} to ${environment} seems to have failed\n'${error.message}'",
          'danger',
          env.SLACK_HOOK,
          env.SLACK_QA_CHANNEL,
          [
            [
              type: "button",
              text: "View Build Logs",
              style:"danger",        
              url: "${currentBuild.absoluteUrl}/console"
            ]
          ])
      }
    }
  }

  stage('Deploy ' + TAG_NAMES[1]){
    def environment = TAG_NAMES[1]
    def url = APP_URLS[1]
    try{
      timeout(time:3, unit: 'DAYS'){ input "Deploy to ${environment}?"}
    }catch(error){
      // The following check will determine whether or not it was a timeout
      // vs being aborted
      node{
        slackNotify(
          "Deployment to ${environment} aborted 😕",
          "Deployment of the ${APP_NAME} app to ${environment} was aborted for build #${currentBuild.number}",
          'warning',
          env.SLACK_HOOK,
          env.SLACK_DEPLOY_CHANNEL,
          [
            [
              type: "button",
              text: "View Build",
              style:"danger",            
              url: "${currentBuild.absoluteUrl}/console"
            ]
          ])
        }
        throw error         
    }

    node{
      openshiftTag destStream: IMAGESTREAM_NAME, verbose: 'true', destTag: environment, srcStream: IMAGESTREAM_NAME, srcTag: "${IMAGE_HASH}"
      slackNotify(
          "New Version in ${environment} 🚀",
          "A new version of the ${APP_NAME} is now in ${environment}",
          'good',
          env.SLACK_HOOK,
          env.SLACK_DEPLOY_CHANNEL,
          [
            [
              type: "button",
              text: "View New Version",           
              url: "${url}"
            ],
          ])
    }  
  }
}else{
  stage('No Changes to Build 👍'){
    currentBuild.result = 'SUCCESS'
  }
}
