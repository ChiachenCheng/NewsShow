var nodejieba = require('nodejieba');

//正则表达式去掉一些无用的字符，与高频但无意义的词。
const regex = /[\t\s\r\n\d\w]|[\+\-\(\),\.。，！？《》@、【】"'：:%-\/“”]/g;

var wordcut = function(vals) {
    var word_freq = {};
    vals.forEach(function (content){
        var newcontent = content["content"].replace(regex,'');
        if(newcontent.length !== 0){
            // console.log();
            var words = nodejieba.cut(newcontent);
            words.forEach(function (word){
                word = word.toString();
                word_freq[word] = (word_freq[word] +1 ) || 1;
            });
        };

    });
    return word_freq;
};
exports.wordcut = wordcut;
