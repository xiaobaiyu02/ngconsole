# @Author: zhangyao
# @Date:   2017-07-18 11:35:11
# @Last Modified by:   zhangyao
# @Last Modified time: 2017-08-23 09:55:15
#!/bin/bash
BRANCH=`git branch|grep '*'`

function genmd5(){
	local tmparr
	case $(uname -s) in
		Darwin)
			md5 -q $1
			;;
		*)
			tmparr=(`md5sum $1`)
			echo ${tmparr[0]}
			;;
	esac
}

if [[ $BRANCH =~ "-dev" ]]; then
	VERSIONS=('pc' 'e-vdi' 'classCh' 'classEn')
elif [[ $BRANCH =~ "-OEM-" ]]; then
	VERSIONS=(`echo $BRANCH|tr '-' ' '`)
	lastpos=$((${#VERSIONS[@]} - 1))
	VERSIONS=(${VERSIONS[$lastpos]})
fi

for version in ${VERSIONS[@]}; do
	cp -f ../new-vdi-client/dist/${version}.zip zips
	mymd5=`genmd5 "zips/${version}.zip"`
	echo "zips/${version}.zip => $mymd5"
	echo $mymd5 > "zips/${version}.md5"
done

