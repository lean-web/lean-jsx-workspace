#/bin/bash

[[ $1 ]] && arg1=$1 || arg1=""

echo $arg1

for d in ./packages/* ; do
    for f in $(git -C $d diff-index HEAD --name-only); do
        if [ "$f" == "package.json" ]; then 
            # echo "$d was updated";
            version_change=$(git -C $d diff --exit-code $f | grep "version")

            current_version=$(jq -r '.version' $d/package.json)

            last_committed_version=$(git -C $d show HEAD:package.json 2> /dev/null | jq -r '.version' 2> /dev/null)
            
            if [[ "$current_version" != "$last_committed_version" ]]; then
                echo "$d: Version updated from $last_committed_version to $current_version"
                npm --prefix $d publish $arg1
                # if [ $? -eq 0 ]; then
                #     echo "Command succeeded."
                # else
                #     echo "Command failed. $?"
                # fi
            else
                echo "$d: Version not updated."
            fi
        fi
    done
done