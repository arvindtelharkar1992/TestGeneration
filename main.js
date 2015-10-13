/*
References:
1)http://stackoverflow.com/questions/1303646/check-whether-variable-is-number-or-string-in-javascript
2)http://stackoverflow.com/questions/9960908/permutations-in-javascript
*/

var esprima = require("esprima");
var options = {tokens:true, tolerant: true, loc: true, range: true };
var faker = require("faker");
var fs = require("fs");
faker.locale = "en";
var mock = require('mock-fs');
var _ = require('underscore');
var Random = require('random-js');

function main()
{
	var args = process.argv.slice(2);

	if( args.length == 0 )
	{
		args = ["subject.js"];
	}
	var filePath = args[0];

	constraints(filePath);

	generateTestCases()

}

var engine = Random.engines.mt19937().autoSeed();

function createConcreteIntegerValue( greaterThan, constraintValue )
{
	if( greaterThan )
		return Random.integer(constraintValue,constraintValue+10)(engine);
	else
		return Random.integer(constraintValue-10,constraintValue)(engine);
}

function Constraint(properties)
{
	this.ident = properties.ident;
	this.expression = properties.expression;
	this.operator = properties.operator;
	this.value = properties.value;
	this.funcName = properties.funcName;
	// Supported kinds: "fileWithContent","fileExists"
	// integer, string, phoneNumber
	this.kind = properties.kind;
}

function fakeDemo()
{
	console.log( faker.phone.phoneNumber() );
	console.log( faker.phone.phoneNumberFormat() );
	console.log( faker.phone.phoneFormats() );
}

var functionConstraints =
{
}

var mockFileLibrary = 
{
	pathExists:
	{
		'pathContent': {}
	},
	fileWithContent:
	{
		pathContent: 
		{	
  			file1: 'text content',
		}
	},
	directoryWithContent:
	{
	    pathContent:
		{
  			file1: '',
		}
	}
};

function generateTestCases()
{
	var content = "var subject = require('./subject.js')\nvar mock = require('mock-fs');\n";
	for ( var funcName in functionConstraints )
	{
		var params = {};

		//var negateparams={};

		// initialize params
		for (var i =0; i < functionConstraints[funcName].params.length; i++ )
		{
			var paramName = functionConstraints[funcName].params[i];
			params[paramName] = '\'' + faker.phone.phoneNumber()+'\'';
			//params[paramName] = '\'\'';
		}

		//console.log( params );

		// update parameter values based on known constraints.
		var constraints = functionConstraints[funcName].constraints;
		// Handle global constraints...
		var fileWithContent = _.some(constraints, {kind: 'fileWithContent' });
		var pathExists      = _.some(constraints, {kind: 'fileExists' });
		var directoryWithContent = _.some(constraints, {kind: 'directoryWithContent' });
		var area = _.some(constraints, {kind: 'area' });

		// plug-in values for parameters
		for( var c = 0; c < constraints.length; c++ )
		{
			//console.log('constraint : ' + constraints[c].ident);
			var constraint = constraints[c];
			if( params.hasOwnProperty( constraint.ident ) )
			{
				params[constraint.ident] = constraint.value;
			}
		}
        
		// Prepare function arguments.
		var args = Object.keys(params).map( function(k) {return params[k]; }).join(",");
     
		var actual_args=args.split(",");

		console.log(actual_args);

		var neg_args_samestr=[];

		var neg_args_diffstr=[];

		var actual_args_diff_str=[];

		var square_args_samestr=[];

		var square_args_diffstr=[];

		
       //preparing the arguments with negated values of original integers but the string being the same
        for( var i = 0; i <actual_args.length ; i++ ){
        	if(isNumber(actual_args[i])==true){
        		var neg = parseInt(actual_args[i]);
        		neg_args_samestr.push(-neg);
        	}
             else{
        	neg_args_samestr.push(actual_args[i]);
        }
        }

      //preparing the arguments with values of original integers but the string being "random"
        for( var i = 0; i <actual_args.length ; i++ ){
        if(isNumber(actual_args[i])==true){  //push integers as they are
        		actual_args_diff_str.push(actual_args[i]);
        	}
             else{  
        	actual_args_diff_str.push('"random"');
        	
        }
        }

       //preparing the arguments with negated values of original integers but the string being "random"
        for( var i = 0; i <actual_args.length ; i++ ){
        	if(isNumber(actual_args[i])==true){
        		var neg = parseInt(actual_args[i]);
        		neg_args_diffstr.push(-neg);
        	}
             else{
        	neg_args_diffstr.push('"random"');
        }
        }
  
       //preparing the arguments with Squared values of original integers but the string being the same    
        for( var i = 0; i <actual_args.length ; i++ ){
        	if(isNumber(actual_args[i])==true){
        		var val = parseInt(actual_args[i]);
        		square_args_samestr.push(val*val);
        	}
             else{
        	square_args_samestr.push(actual_args[i]);
        }
        }

        //preparing the arguments with negated values of original integers but the string being "random"
        for( var i = 0; i <actual_args.length ; i++ ){
        	if(isNumber(actual_args[i])==true){
        		var val = parseInt(actual_args[i]);
        		square_args_diffstr.push(val*val);
        	}
             else{
        	square_args_diffstr.push('"random"');
        }
        }

       // console.log(square_args_diffstr);

		if( pathExists || fileWithContent )
		{
			content += generateMockFsTestCases(pathExists,fileWithContent,directoryWithContent,funcName, args);
			// Bonus...generate constraint variations test cases....
			content += generateMockFsTestCases(pathExists,fileWithContent,!directoryWithContent,funcName, args);
			content += generateMockFsTestCases(pathExists,!fileWithContent,directoryWithContent,funcName, args);
			content += generateMockFsTestCases(pathExists,!fileWithContent,!directoryWithContent,funcName, args);
            content += generateMockFsTestCases(!pathExists,fileWithContent,directoryWithContent,funcName, args);
            content += generateMockFsTestCases(!pathExists,fileWithContent,!directoryWithContent,funcName, args);
            content += generateMockFsTestCases(!pathExists,!fileWithContent,directoryWithContent,funcName, args);
            content += generateMockFsTestCases(!pathExists,!fileWithContent,!directoryWithContent,funcName, args);
		}
      else if(area){
      	    var newarea='';
            content += "subject.{0}({1});\n".format(funcName, args );
            for(var contr=0;contr<constraints.length;contr++)
            {
                  
                  var con = constraints[contr];
                  if(con.kind=='area'){
                      newarea=con.value.substring(1,4);
                  }
             }
             var e=Object.keys(params).map( function(k) {
                  var area;
                  params[k]='\''+faker.phone.phoneNumber()+'\'';
                  if(params[k].indexOf("(")==1)
 					area=params[k].substring(2,5);
 				  else
 				  {
 				  	area=params[k].substring(1,4);
 				  }
                return params[k].replace(area,newarea);
           

            }).join(",");
         
             content += "subject.{0}({1});\n".format(funcName,e);



        }

		else
		{
			// Emit simple test case.
			content += "subject.{0}({1});\n".format(funcName, args );
			content += "subject.{0}({1});\n".format(funcName, neg_args_samestr.join(",") );
			content += "subject.{0}({1});\n".format(funcName, actual_args_diff_str.join(",") );
			content += "subject.{0}({1});\n".format(funcName, neg_args_diffstr.join(",") );
			content += "subject.{0}({1});\n".format(funcName, square_args_samestr.join(",") );
			content += "subject.{0}({1});\n".format(funcName, square_args_diffstr.join(",") );
		}

	}


	fs.writeFileSync('test.js', content, "utf8");

}

//function for checking integer
function isNumber(n) { return /^-?[\d.]+(?:e-?\d+)?$/.test(n); } 

function generateMockFsTestCases (pathExists,fileWithContent,directoryWithContent,funcName,args) 
{
	var testCase = "";
	// Build mock file system based on constraints.
	var mergedFS = {};
	if( pathExists )
	{
		for (var attrname in mockFileLibrary.pathExists) { mergedFS[attrname] = mockFileLibrary.pathExists[attrname]; }
	}
	if( fileWithContent )
	{
		for (var attrname in mockFileLibrary.fileWithContent) { mergedFS[attrname] = mockFileLibrary.fileWithContent[attrname]; }
	}
   if( directoryWithContent )
   {
   	for (var attrname in mockFileLibrary.directoryWithContent) { mergedFS[attrname] = mockFileLibrary.directoryWithContent[attrname]; }
   }

	testCase += 
	"mock(" +
		JSON.stringify(mergedFS)
		+
	");\n";

	testCase += "\tsubject.{0}({1});\n".format(funcName, args );
	testCase+="mock.restore();\n";
	return testCase;
}

function constraints(filePath)
{
   var buf = fs.readFileSync(filePath, "utf8");
	var result = esprima.parse(buf, options);

	traverse(result, function (node) 
	{
		if (node.type === 'FunctionDeclaration') 
		{
			var funcName = functionName(node);
			console.log("Line : {0} Function: {1}".format(node.loc.start.line, funcName ));

			var params = node.params.map(function(p) {return p.name});

			functionConstraints[funcName] = {constraints:[], params: params};

			// Check for expressions using argument.
			traverse(node, function(child)
			{
				if( child.type === 'BinaryExpression' && child.operator == "==")
				{
					if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1)
					{
						// get expression from original source code:
						var expression = buf.substring(child.range[0], child.range[1]);
						var rightHand = buf.substring(child.right.range[0], child.right.range[1])

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: rightHand,
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));
					}

                  if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) == -1)
					{
						// get expression from original source code:
						var expression = buf.substring(child.range[0], child.range[1]);
						var rightHand = buf.substring(child.right.range[0], child.right.range[1])

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: rightHand,
								funcName: funcName,
								kind: "area",
								operator : child.operator,
								expression: expression
							}));
					}
                     


				}
                 //--------less than
                 if( child.type === 'BinaryExpression' && child.operator == "<")
				{
					if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1)
					{
						// get expression from original source code:
						var expression = buf.substring(child.range[0], child.range[1]);
						var rightHand = buf.substring(child.right.range[0], child.right.range[1])

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: rightHand-1,
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));
					}
				}
            ////----------------------------------end less than


            //----greater than
            if( child.type === 'BinaryExpression' && child.operator == ">")
				{
					if( child.left.type == 'Identifier' && params.indexOf( child.left.name ) > -1)
					{
						// get expression from original source code:
						var expression = buf.substring(child.range[0], child.range[1]);
						var rightHand = buf.substring(child.right.range[0], child.right.range[1])

						functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: child.left.name,
								value: rightHand+1,
								funcName: funcName,
								kind: "integer",
								operator : child.operator,
								expression: expression
							}));
					}
				}
				//----------------------end greater than
                
                //------------readdirsync--------------------------------

                if( child.type == "CallExpression" && 
					 child.callee.property &&
					 child.callee.property.name =="readdirSync")
				{
					for( var p =0; p < params.length; p++ )
					{
						if( child.arguments[0].name == params[p] )
						{
							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[p],
								value:  "'pathContent'",
								funcName: funcName,
								kind: "directoryWithContent",
								operator : child.operator,
								expression: expression
							}));
						}
					}
				}

                //----------------------------------------------------



				if( child.type == "CallExpression" && 
					 child.callee.property &&
					 child.callee.property.name =="readFileSync" )
				{
					for( var p =0; p < params.length; p++ )
					{
						if( child.arguments[0].name == params[p] )
						{
							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[p],
								value:  "'pathContent/file1'",
								funcName: funcName,
								kind: "fileWithContent",
								operator : child.operator,
								expression: expression
							}));
						}
					}
				}

				if( child.type == "CallExpression" &&
					 child.callee.property &&
					 child.callee.property.name =="existsSync")
				{
					for( var p =0; p < params.length; p++ )
					{
						if( child.arguments[0].name == params[p] )
						{
							functionConstraints[funcName].constraints.push( 
							new Constraint(
							{
								ident: params[p],
								// A fake path to a file
								value:  "'path/fileExists'",
								funcName: funcName,
								kind: "fileExists",
								operator : child.operator,
								expression: expression
							}));
						}
					}
				}

			});

			console.log( functionConstraints[funcName]);

		}
	});
}

function traverse(object, visitor) 
{
    var key, child;

    visitor.call(null, object);
    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null) {
                traverse(child, visitor);
            }
        }
    }
}

function traverseWithCancel(object, visitor)
{
    var key, child;

    if( visitor.call(null, object) )
    {
	    for (key in object) {
	        if (object.hasOwnProperty(key)) {
	            child = object[key];
	            if (typeof child === 'object' && child !== null) {
	                traverseWithCancel(child, visitor);
	            }
	        }
	    }
 	 }
}

function functionName( node )
{
	if( node.id )
	{
		return node.id.name;
	}
	return "";
}


if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

main();
