
numbers=( "3" "4" "5" "6" "7" "8" "9" "10" "11" "12" "13" "14" "15" )
titles=( "three" "four" "five" "six" "seven" "eight" "nine" "ten" "eleven" "twelve" "thirteen" "fourteen" "fifteen" )

for i in "${!numbers[@]}"
do
  number=${numbers[$i]}
  title=${titles[$i]}
  echo "building " $number " into " $title

  cp js/template.js video/$title/js/
  browserify video/$title/js/template.js -o video/$title/js/build.js
  rm video/$title/js/template.js
done
