if [ "$1" == 'commit' ]
then
    git add . && git commit -m "$2" && git pull origin && git push origin --all
elif [ "$1" == 'pull' ]
then
    git pull origin
fi
