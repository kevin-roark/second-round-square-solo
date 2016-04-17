
numbers=( "1" "2" "3" "4" "5" "6" "7" "8" "9" "10" "11" )

for number in "${numbers[@]}"
do
  echo "building " $number

  ../frampton/src/cli/web-bundle.js score.js media_config_$number.json --out sequence-$number/
done
