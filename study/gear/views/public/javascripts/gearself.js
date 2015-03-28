/**
 * Created with IntelliJ IDEA.
 * User: dingye
 * Date: 14-1-25
 * Time: 下午1:55
 * To change this template use File | Settings | File Templates.
 */
/*!
 * Sizzle CSS Selector Engine v@VERSION
 * http://sizzlejs.com/
 *
 * Copyright 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: @DATE
 */
(function (window) {

    var i,
        support,
        Expr,
        getText,
        isXML,
        compile,
        select,
        outermostContext,
        sortInput,
        hasDuplicate,

    // Local document vars
        setDocument,
        document,
        docElem,
        documentIsHTML,
        rbuggyQSA,
        rbuggyMatches,
        matches,
        contains,

    // Instance-specific data
        expando = "sizzle" + -(new Date()),
        preferredDoc = window.document,
        dirruns = 0,
        done = 0,
        classCache = createCache(),
        tokenCache = createCache(),
        compilerCache = createCache(),
        sortOrder = function (a, b) {
            if (a === b) {
                hasDuplicate = true;
            }
            return 0;
        },

    // General-purpose constants
        strundefined = typeof undefined,
        MAX_NEGATIVE = 1 << 31,

    // Instance methods
        hasOwn = ({}).hasOwnProperty,
        arr = [],
        pop = arr.pop,
        push_native = arr.push,
        push = arr.push,
        slice = arr.slice,
    // Use a stripped-down indexOf if we can't use a native one
        indexOf = arr.indexOf || function (elem) {
            var i = 0,
                len = this.length;
            for (; i < len; i++) {
                if (this[i] === elem) {
                    return i;
                }
            }
            return -1;
        },

        booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

    // Regular expressions

    // Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
        whitespace = "[\\x20\\t\\r\\n\\f]",
    // http://www.w3.org/TR/css3-syntax/#characters
        characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

    // Loosely modeled on CSS identifier characters
    // An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
    // Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
        identifier = characterEncoding.replace("w", "w#"),

    // Acceptable operators http://www.w3.org/TR/selectors/#attribute-selectors
        attributes = "\\[" + whitespace + "*(" + characterEncoding + ")" + whitespace +
            "*(?:([*^$|!~]?=)" + whitespace + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + identifier + ")|)|)" + whitespace + "*\\]",

    // Prefer arguments quoted,
    //   then not containing pseudos/brackets,
    //   then attribute selectors/non-parenthetical expressions,
    //   then anything else
    // These preferences are here to reduce the number of selectors
    //   needing tokenize in the PSEUDO preFilter
        pseudos = ":(" + characterEncoding + ")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|" + attributes.replace(3, 8) + ")*)|.*)\\)|)",

    // Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
        rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"),

        rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"),
        rcombinators = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"),

        rattributeQuotes = new RegExp("=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g"),

        rpseudo = new RegExp(pseudos),
        ridentifier = new RegExp("^" + identifier + "$"),

        matchExpr = {
            "ID": new RegExp("^#(" + characterEncoding + ")"),
            "CLASS": new RegExp("^\\.(" + characterEncoding + ")"),
            "TAG": new RegExp("^(" + characterEncoding.replace("w", "w*") + ")"),
            "ATTR": new RegExp("^" + attributes),
            "PSEUDO": new RegExp("^" + pseudos),
            "CHILD": new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
                "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
                "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
            "bool": new RegExp("^(?:" + booleans + ")$", "i"),
            // For use in libraries implementing .is()
            // We use this for POS matching in `select`
            "needsContext": new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
                whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
        },

        rinputs = /^(?:input|select|textarea|button)$/i,
        rheader = /^h\d$/i,

        rnative = /^[^{]+\{\s*\[native \w/,

    // Easily-parseable/retrievable ID or TAG or CLASS selectors
        rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

        rsibling = /[+~]/,
        rescape = /'|\\/g,

    // CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
        runescape = new RegExp("\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig"),
        funescape = function (_, escaped, escapedWhitespace) {
            var high = "0x" + escaped - 0x10000;
            // NaN means non-codepoint
            // Support: Firefox
            // Workaround erroneous numeric interpretation of +"0x"
            return high !== high || escapedWhitespace ?
                escaped :
                high < 0 ?
                    // BMP codepoint
                    String.fromCharCode(high + 0x10000) :
                    // Supplemental Plane codepoint (surrogate pair)
                    String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
        };

// Optimize for push.apply( _, NodeList )
    try {
        push.apply(
            (arr = slice.call(preferredDoc.childNodes)),
            preferredDoc.childNodes
        );
        // Support: Android<4.0
        // Detect silently failing push.apply
        arr[ preferredDoc.childNodes.length ].nodeType;
    } catch (e) {
        push = { apply: arr.length ?

            // Leverage slice if possible
            function (target, els) {
                push_native.apply(target, slice.call(els));
            } :

            // Support: IE<9
            // Otherwise append directly
            function (target, els) {
                var j = target.length,
                    i = 0;
                // Can't trust NodeList.length
                while ((target[j++] = els[i++])) {
                }
                target.length = j - 1;
            }
        };
    }

    function Sizzle(selector, context, results, seed) {
        var match, elem, m, nodeType,
        // QSA vars
            i, groups, old, nid, newContext, newSelector;

        if (( context ? context.ownerDocument || context : preferredDoc ) !== document) {
            setDocument(context);
        }

        context = context || document;
        results = results || [];

        if (!selector || typeof selector !== "string") {
            return results;
        }

        if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {
            return [];
        }

        if (documentIsHTML && !seed) {

            // Shortcuts
            if ((match = rquickExpr.exec(selector))) {
                // Speed-up: Sizzle("#ID")
                if ((m = match[1])) {
                    if (nodeType === 9) {
                        elem = context.getElementById(m);
                        // Check parentNode to catch when Blackberry 4.6 returns
                        // nodes that are no longer in the document (jQuery #6963)
                        if (elem && elem.parentNode) {
                            // Handle the case where IE, Opera, and Webkit return items
                            // by name instead of ID
                            if (elem.id === m) {
                                results.push(elem);
                                return results;
                            }
                        } else {
                            return results;
                        }
                    } else {
                        // Context is not a document
                        if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) &&
                            contains(context, elem) && elem.id === m) {
                            results.push(elem);
                            return results;
                        }
                    }

                    // Speed-up: Sizzle("TAG")
                } else if (match[2]) {
                    push.apply(results, context.getElementsByTagName(selector));
                    return results;

                    // Speed-up: Sizzle(".CLASS")
                } else if ((m = match[3]) && support.getElementsByClassName && context.getElementsByClassName) {
                    push.apply(results, context.getElementsByClassName(m));
                    return results;
                }
            }

            // QSA path
            if (support.qsa && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
                nid = old = expando;
                newContext = context;
                newSelector = nodeType === 9 && selector;

                // qSA works strangely on Element-rooted queries
                // We can work around this by specifying an extra ID on the root
                // and working up from there (Thanks to Andrew Dupont for the technique)
                // IE 8 doesn't work on object elements
                if (nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
                    groups = tokenize(selector);

                    if ((old = context.getAttribute("id"))) {
                        nid = old.replace(rescape, "\\$&");
                    } else {
                        context.setAttribute("id", nid);
                    }
                    nid = "[id='" + nid + "'] ";

                    i = groups.length;
                    while (i--) {
                        groups[i] = nid + toSelector(groups[i]);
                    }
                    newContext = rsibling.test(selector) && testContext(context.parentNode) || context;
                    newSelector = groups.join(",");
                }

                if (newSelector) {
                    try {
                        push.apply(results,
                            newContext.querySelectorAll(newSelector)
                        );
                        return results;
                    } catch (qsaError) {
                    } finally {
                        if (!old) {
                            context.removeAttribute("id");
                        }
                    }
                }
            }
        }

        // All others
        return select(selector.replace(rtrim, "$1"), context, results, seed);
    }

    /**
     * Create key-value caches of limited size
     * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
     *    property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
     *    deleting the oldest entry
     */
    function createCache() {
        var keys = [];

        function cache(key, value) {
            // Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
            if (keys.push(key + " ") > Expr.cacheLength) {
                // Only keep the most recent entries
                delete cache[ keys.shift() ];
            }
            return (cache[ key + " " ] = value);
        }

        return cache;
    }

    /**
     * Mark a function for special use by Sizzle
     * @param {Function} fn The function to mark
     */
    function markFunction(fn) {
        fn[ expando ] = true;
        return fn;
    }

    /**
     * Support testing using an element
     * @param {Function} fn Passed the created div and expects a boolean result
     */
    function assert(fn) {
        var div = document.createElement("div");

        try {
            return !!fn(div);
        } catch (e) {
            return false;
        } finally {
            // Remove from its parent by default
            if (div.parentNode) {
                div.parentNode.removeChild(div);
            }
            // release memory in IE
            div = null;
        }
    }

    /**
     * Adds the same handler for all of the specified attrs
     * @param {String} attrs Pipe-separated list of attributes
     * @param {Function} handler The method that will be applied
     */
    function addHandle(attrs, handler) {
        var arr = attrs.split("|"),
            i = attrs.length;

        while (i--) {
            Expr.attrHandle[ arr[i] ] = handler;
        }
    }

    /**
     * Checks document order of two siblings
     * @param {Element} a
     * @param {Element} b
     * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
     */
    function siblingCheck(a, b) {
        var cur = b && a,
            diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
                ( ~b.sourceIndex || MAX_NEGATIVE ) -
                    ( ~a.sourceIndex || MAX_NEGATIVE );

        // Use IE sourceIndex if available on both nodes
        if (diff) {
            return diff;
        }

        // Check if b follows a
        if (cur) {
            while ((cur = cur.nextSibling)) {
                if (cur === b) {
                    return -1;
                }
            }
        }

        return a ? 1 : -1;
    }

    /**
     * Returns a function to use in pseudos for input types
     * @param {String} type
     */
    function createInputPseudo(type) {
        return function (elem) {
            var name = elem.nodeName.toLowerCase();
            return name === "input" && elem.type === type;
        };
    }

    /**
     * Returns a function to use in pseudos for buttons
     * @param {String} type
     */
    function createButtonPseudo(type) {
        return function (elem) {
            var name = elem.nodeName.toLowerCase();
            return (name === "input" || name === "button") && elem.type === type;
        };
    }

    /**
     * Returns a function to use in pseudos for positionals
     * @param {Function} fn
     */
    function createPositionalPseudo(fn) {
        return markFunction(function (argument) {
            argument = +argument;
            return markFunction(function (seed, matches) {
                var j,
                    matchIndexes = fn([], seed.length, argument),
                    i = matchIndexes.length;

                // Match elements found at the specified indexes
                while (i--) {
                    if (seed[ (j = matchIndexes[i]) ]) {
                        seed[j] = !(matches[j] = seed[j]);
                    }
                }
            });
        });
    }

    /**
     * Checks a node for validity as a Sizzle context
     * @param {Element|Object=} context
     * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
     */
    function testContext(context) {
        return context && typeof context.getElementsByTagName !== strundefined && context;
    }

// Expose support vars for convenience
    support = Sizzle.support = {};

    /**
     * Detects XML nodes
     * @param {Element|Object} elem An element or a document
     * @returns {Boolean} True iff elem is a non-HTML XML node
     */
    isXML = Sizzle.isXML = function (elem) {
        // documentElement is verified for cases where it doesn't yet exist
        // (such as loading iframes in IE - #4833)
        var documentElement = elem && (elem.ownerDocument || elem).documentElement;
        return documentElement ? documentElement.nodeName !== "HTML" : false;
    };

    /**
     * Sets document-related variables once based on the current document
     * @param {Element|Object} [doc] An element or document object to use to set the document
     * @returns {Object} Returns the current document
     */
    setDocument = Sizzle.setDocument = function (node) {
        var hasCompare,
            doc = node ? node.ownerDocument || node : preferredDoc,
            parent = doc.defaultView;

        // If no document and documentElement is available, return
        if (doc === document || doc.nodeType !== 9 || !doc.documentElement) {
            return document;
        }

        // Set our document
        document = doc;
        docElem = doc.documentElement;

        // Support tests
        documentIsHTML = !isXML(doc);

        // Support: IE>8
        // If iframe document is assigned to "document" variable and if iframe has been reloaded,
        // IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
        // IE6-8 do not support the defaultView property so parent will be undefined
        if (parent && parent !== parent.top) {
            // IE11 does not have attachEvent, so all must suffer
            if (parent.addEventListener) {
                parent.addEventListener("unload", function () {
                    setDocument();
                }, false);
            } else if (parent.attachEvent) {
                parent.attachEvent("onunload", function () {
                    setDocument();
                });
            }
        }

        /* Attributes
         ---------------------------------------------------------------------- */

        // Support: IE<8
        // Verify that getAttribute really returns attributes and not properties (excepting IE8 booleans)
        support.attributes = assert(function (div) {
            div.className = "i";
            return !div.getAttribute("className");
        });

        /* getElement(s)By*
         ---------------------------------------------------------------------- */

        // Check if getElementsByTagName("*") returns only elements
        support.getElementsByTagName = assert(function (div) {
            div.appendChild(doc.createComment(""));
            return !div.getElementsByTagName("*").length;
        });

        // Check if getElementsByClassName can be trusted
        support.getElementsByClassName = rnative.test(doc.getElementsByClassName) && assert(function (div) {
            div.innerHTML = "<div class='a'></div><div class='a i'></div>";

            // Support: Safari<4
            // Catch class over-caching
            div.firstChild.className = "i";
            // Support: Opera<10
            // Catch gEBCN failure to find non-leading classes
            return div.getElementsByClassName("i").length === 2;
        });

        // Support: IE<10
        // Check if getElementById returns elements by name
        // The broken getElementById methods don't pick up programatically-set names,
        // so use a roundabout getElementsByName test
        support.getById = assert(function (div) {
            docElem.appendChild(div).id = expando;
            return !doc.getElementsByName || !doc.getElementsByName(expando).length;
        });

        // ID find and filter
        if (support.getById) {
            Expr.find["ID"] = function (id, context) {
                if (typeof context.getElementById !== strundefined && documentIsHTML) {
                    var m = context.getElementById(id);
                    // Check parentNode to catch when Blackberry 4.6 returns
                    // nodes that are no longer in the document #6963
                    return m && m.parentNode ? [m] : [];
                }
            };
            Expr.filter["ID"] = function (id) {
                var attrId = id.replace(runescape, funescape);
                return function (elem) {
                    return elem.getAttribute("id") === attrId;
                };
            };
        } else {
            // Support: IE6/7
            // getElementById is not reliable as a find shortcut
            delete Expr.find["ID"];

            Expr.filter["ID"] = function (id) {
                var attrId = id.replace(runescape, funescape);
                return function (elem) {
                    var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
                    return node && node.value === attrId;
                };
            };
        }

        // Tag
        Expr.find["TAG"] = support.getElementsByTagName ?
            function (tag, context) {
                if (typeof context.getElementsByTagName !== strundefined) {
                    return context.getElementsByTagName(tag);
                }
            } :
            function (tag, context) {
                var elem,
                    tmp = [],
                    i = 0,
                    results = context.getElementsByTagName(tag);

                // Filter out possible comments
                if (tag === "*") {
                    while ((elem = results[i++])) {
                        if (elem.nodeType === 1) {
                            tmp.push(elem);
                        }
                    }

                    return tmp;
                }
                return results;
            };

        // Class
        Expr.find["CLASS"] = support.getElementsByClassName && function (className, context) {
            if (typeof context.getElementsByClassName !== strundefined && documentIsHTML) {
                return context.getElementsByClassName(className);
            }
        };

        /* QSA/matchesSelector
         ---------------------------------------------------------------------- */

        // QSA and matchesSelector support

        // matchesSelector(:active) reports false when true (IE9/Opera 11.5)
        rbuggyMatches = [];

        // qSa(:focus) reports false when true (Chrome 21)
        // We allow this because of a bug in IE8/9 that throws an error
        // whenever `document.activeElement` is accessed on an iframe
        // So, we allow :focus to pass through QSA all the time to avoid the IE error
        // See http://bugs.jquery.com/ticket/13378
        rbuggyQSA = [];

        if ((support.qsa = rnative.test(doc.querySelectorAll))) {
            // Build QSA regex
            // Regex strategy adopted from Diego Perini
            assert(function (div) {
                // Select is set to empty string on purpose
                // This is to test IE's treatment of not explicitly
                // setting a boolean content attribute,
                // since its presence should be enough
                // http://bugs.jquery.com/ticket/12359
                div.innerHTML = "<select t=''><option selected=''></option></select>";

                // Support: IE8, Opera 10-12
                // Nothing should be selected when empty strings follow ^= or $= or *=
                if (div.querySelectorAll("[t^='']").length) {
                    rbuggyQSA.push("[*^$]=" + whitespace + "*(?:''|\"\")");
                }

                // Support: IE8
                // Boolean attributes and "value" are not treated correctly
                if (!div.querySelectorAll("[selected]").length) {
                    rbuggyQSA.push("\\[" + whitespace + "*(?:value|" + booleans + ")");
                }

                // Webkit/Opera - :checked should return selected option elements
                // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
                // IE8 throws error here and will not see later tests
                if (!div.querySelectorAll(":checked").length) {
                    rbuggyQSA.push(":checked");
                }
            });

            assert(function (div) {
                // Support: Windows 8 Native Apps
                // The type and name attributes are restricted during .innerHTML assignment
                var input = doc.createElement("input");
                input.setAttribute("type", "hidden");
                div.appendChild(input).setAttribute("name", "D");

                // Support: IE8
                // Enforce case-sensitivity of name attribute
                if (div.querySelectorAll("[name=d]").length) {
                    rbuggyQSA.push("name" + whitespace + "*[*^$|!~]?=");
                }

                // FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
                // IE8 throws error here and will not see later tests
                if (!div.querySelectorAll(":enabled").length) {
                    rbuggyQSA.push(":enabled", ":disabled");
                }

                // Opera 10-11 does not throw on post-comma invalid pseudos
                div.querySelectorAll("*,:x");
                rbuggyQSA.push(",.*:");
            });
        }

        if ((support.matchesSelector = rnative.test((matches = docElem.webkitMatchesSelector ||
            docElem.mozMatchesSelector ||
            docElem.oMatchesSelector ||
            docElem.msMatchesSelector)))) {

            assert(function (div) {
                // Check to see if it's possible to do matchesSelector
                // on a disconnected node (IE 9)
                support.disconnectedMatch = matches.call(div, "div");

                // This should fail with an exception
                // Gecko does not error, returns false instead
                matches.call(div, "[s!='']:x");
                rbuggyMatches.push("!=", pseudos);
            });
        }

        rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
        rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join("|"));

        /* Contains
         ---------------------------------------------------------------------- */
        hasCompare = rnative.test(docElem.compareDocumentPosition);

        // Element contains another
        // Purposefully does not implement inclusive descendent
        // As in, an element does not contain itself
        contains = hasCompare || rnative.test(docElem.contains) ?
            function (a, b) {
                var adown = a.nodeType === 9 ? a.documentElement : a,
                    bup = b && b.parentNode;
                return a === bup || !!( bup && bup.nodeType === 1 && (
                    adown.contains ?
                        adown.contains(bup) :
                        a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16
                    ));
            } :
            function (a, b) {
                if (b) {
                    while ((b = b.parentNode)) {
                        if (b === a) {
                            return true;
                        }
                    }
                }
                return false;
            };

        /* Sorting
         ---------------------------------------------------------------------- */

        // Document order sorting
        sortOrder = hasCompare ?
            function (a, b) {

                // Flag for duplicate removal
                if (a === b) {
                    hasDuplicate = true;
                    return 0;
                }

                // Sort on method existence if only one input has compareDocumentPosition
                var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
                if (compare) {
                    return compare;
                }

                // Calculate position if both inputs belong to the same document
                compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
                    a.compareDocumentPosition(b) :

                    // Otherwise we know they are disconnected
                    1;

                // Disconnected nodes
                if (compare & 1 ||
                    (!support.sortDetached && b.compareDocumentPosition(a) === compare)) {

                    // Choose the first element that is related to our preferred document
                    if (a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a)) {
                        return -1;
                    }
                    if (b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b)) {
                        return 1;
                    }

                    // Maintain original order
                    return sortInput ?
                        ( indexOf.call(sortInput, a) - indexOf.call(sortInput, b) ) :
                        0;
                }

                return compare & 4 ? -1 : 1;
            } :
            function (a, b) {
                // Exit early if the nodes are identical
                if (a === b) {
                    hasDuplicate = true;
                    return 0;
                }

                var cur,
                    i = 0,
                    aup = a.parentNode,
                    bup = b.parentNode,
                    ap = [ a ],
                    bp = [ b ];

                // Parentless nodes are either documents or disconnected
                if (!aup || !bup) {
                    return a === doc ? -1 :
                        b === doc ? 1 :
                            aup ? -1 :
                                bup ? 1 :
                                    sortInput ?
                                        ( indexOf.call(sortInput, a) - indexOf.call(sortInput, b) ) :
                                        0;

                    // If the nodes are siblings, we can do a quick check
                } else if (aup === bup) {
                    return siblingCheck(a, b);
                }

                // Otherwise we need full lists of their ancestors for comparison
                cur = a;
                while ((cur = cur.parentNode)) {
                    ap.unshift(cur);
                }
                cur = b;
                while ((cur = cur.parentNode)) {
                    bp.unshift(cur);
                }

                // Walk down the tree looking for a discrepancy
                while (ap[i] === bp[i]) {
                    i++;
                }

                return i ?
                    // Do a sibling check if the nodes have a common ancestor
                    siblingCheck(ap[i], bp[i]) :

                    // Otherwise nodes in our document sort first
                    ap[i] === preferredDoc ? -1 :
                        bp[i] === preferredDoc ? 1 :
                            0;
            };

        return doc;
    };

    Sizzle.matches = function (expr, elements) {
        return Sizzle(expr, null, null, elements);
    };

    Sizzle.matchesSelector = function (elem, expr) {
        // Set document vars if needed
        if (( elem.ownerDocument || elem ) !== document) {
            setDocument(elem);
        }

        // Make sure that attribute selectors are quoted
        expr = expr.replace(rattributeQuotes, "='$1']");

        if (support.matchesSelector && documentIsHTML &&
            ( !rbuggyMatches || !rbuggyMatches.test(expr) ) &&
            ( !rbuggyQSA || !rbuggyQSA.test(expr) )) {

            try {
                var ret = matches.call(elem, expr);

                // IE 9's matchesSelector returns false on disconnected nodes
                if (ret || support.disconnectedMatch ||
                    // As well, disconnected nodes are said to be in a document
                    // fragment in IE 9
                    elem.document && elem.document.nodeType !== 11) {
                    return ret;
                }
            } catch (e) {
            }
        }

        return Sizzle(expr, document, null, [elem]).length > 0;
    };

    Sizzle.contains = function (context, elem) {
        // Set document vars if needed
        if (( context.ownerDocument || context ) !== document) {
            setDocument(context);
        }
        return contains(context, elem);
    };

    Sizzle.attr = function (elem, name) {
        // Set document vars if needed
        if (( elem.ownerDocument || elem ) !== document) {
            setDocument(elem);
        }

        var fn = Expr.attrHandle[ name.toLowerCase() ],
        // Don't get fooled by Object.prototype properties (jQuery #13807)
            val = fn && hasOwn.call(Expr.attrHandle, name.toLowerCase()) ?
                fn(elem, name, !documentIsHTML) :
                undefined;

        return val !== undefined ?
            val :
            support.attributes || !documentIsHTML ?
                elem.getAttribute(name) :
                (val = elem.getAttributeNode(name)) && val.specified ?
                    val.value :
                    null;
    };

    Sizzle.error = function (msg) {
        throw new Error("Syntax error, unrecognized expression: " + msg);
    };

    /**
     * Document sorting and removing duplicates
     * @param {ArrayLike} results
     */
    Sizzle.uniqueSort = function (results) {
        var elem,
            duplicates = [],
            j = 0,
            i = 0;

        // Unless we *know* we can detect duplicates, assume their presence
        hasDuplicate = !support.detectDuplicates;
        sortInput = !support.sortStable && results.slice(0);
        results.sort(sortOrder);

        if (hasDuplicate) {
            while ((elem = results[i++])) {
                if (elem === results[ i ]) {
                    j = duplicates.push(i);
                }
            }
            while (j--) {
                results.splice(duplicates[ j ], 1);
            }
        }

        // Clear input after sorting to release objects
        // See https://github.com/jquery/sizzle/pull/225
        sortInput = null;

        return results;
    };

    /**
     * Utility function for retrieving the text value of an array of DOM nodes
     * @param {Array|Element} elem
     */
    getText = Sizzle.getText = function (elem) {
        var node,
            ret = "",
            i = 0,
            nodeType = elem.nodeType;

        if (!nodeType) {
            // If no nodeType, this is expected to be an array
            while ((node = elem[i++])) {
                // Do not traverse comment nodes
                ret += getText(node);
            }
        } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
            // Use textContent for elements
            // innerText usage removed for consistency of new lines (jQuery #11153)
            if (typeof elem.textContent === "string") {
                return elem.textContent;
            } else {
                // Traverse its children
                for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                    ret += getText(elem);
                }
            }
        } else if (nodeType === 3 || nodeType === 4) {
            return elem.nodeValue;
        }
        // Do not include comment or processing instruction nodes

        return ret;
    };

    Expr = Sizzle.selectors = {

        // Can be adjusted by the user
        cacheLength: 50,

        createPseudo: markFunction,

        match: matchExpr,

        attrHandle: {},

        find: {},

        relative: {
            ">": { dir: "parentNode", first: true },
            " ": { dir: "parentNode" },
            "+": { dir: "previousSibling", first: true },
            "~": { dir: "previousSibling" }
        },

        preFilter: {
            "ATTR": function (match) {
                match[1] = match[1].replace(runescape, funescape);

                // Move the given value to match[3] whether quoted or unquoted
                match[3] = ( match[4] || match[5] || "" ).replace(runescape, funescape);

                if (match[2] === "~=") {
                    match[3] = " " + match[3] + " ";
                }

                return match.slice(0, 4);
            },

            "CHILD": function (match) {
                /* matches from matchExpr["CHILD"]
                 1 type (only|nth|...)
                 2 what (child|of-type)
                 3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
                 4 xn-component of xn+y argument ([+-]?\d*n|)
                 5 sign of xn-component
                 6 x of xn-component
                 7 sign of y-component
                 8 y of y-component
                 */
                match[1] = match[1].toLowerCase();

                if (match[1].slice(0, 3) === "nth") {
                    // nth-* requires argument
                    if (!match[3]) {
                        Sizzle.error(match[0]);
                    }

                    // numeric x and y parameters for Expr.filter.CHILD
                    // remember that false/true cast respectively to 0/1
                    match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
                    match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

                    // other types prohibit arguments
                } else if (match[3]) {
                    Sizzle.error(match[0]);
                }

                return match;
            },

            "PSEUDO": function (match) {
                var excess,
                    unquoted = !match[5] && match[2];

                if (matchExpr["CHILD"].test(match[0])) {
                    return null;
                }

                // Accept quoted arguments as-is
                if (match[3] && match[4] !== undefined) {
                    match[2] = match[4];

                    // Strip excess characters from unquoted arguments
                } else if (unquoted && rpseudo.test(unquoted) &&
                    // Get excess from tokenize (recursively)
                    (excess = tokenize(unquoted, true)) &&
                    // advance to the next closing parenthesis
                    (excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length)) {

                    // excess is a negative index
                    match[0] = match[0].slice(0, excess);
                    match[2] = unquoted.slice(0, excess);
                }

                // Return only captures needed by the pseudo filter method (type and argument)
                return match.slice(0, 3);
            }
        },

        filter: {

            "TAG": function (nodeNameSelector) {
                var nodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
                return nodeNameSelector === "*" ?
                    function () {
                        return true;
                    } :
                    function (elem) {
                        return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
                    };
            },

            "CLASS": function (className) {
                var pattern = classCache[ className + " " ];

                return pattern ||
                    (pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) &&
                        classCache(className, function (elem) {
                            return pattern.test(typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute("class") || "");
                        });
            },

            "ATTR": function (name, operator, check) {
                return function (elem) {
                    var result = Sizzle.attr(elem, name);

                    if (result == null) {
                        return operator === "!=";
                    }
                    if (!operator) {
                        return true;
                    }

                    result += "";

                    return operator === "=" ? result === check :
                        operator === "!=" ? result !== check :
                            operator === "^=" ? check && result.indexOf(check) === 0 :
                                operator === "*=" ? check && result.indexOf(check) > -1 :
                                    operator === "$=" ? check && result.slice(-check.length) === check :
                                        operator === "~=" ? ( " " + result + " " ).indexOf(check) > -1 :
                                            operator === "|=" ? result === check || result.slice(0, check.length + 1) === check + "-" :
                                                false;
                };
            },

            "CHILD": function (type, what, argument, first, last) {
                var simple = type.slice(0, 3) !== "nth",
                    forward = type.slice(-4) !== "last",
                    ofType = what === "of-type";

                return first === 1 && last === 0 ?

                    // Shortcut for :nth-*(n)
                    function (elem) {
                        return !!elem.parentNode;
                    } :

                    function (elem, context, xml) {
                        var cache, outerCache, node, diff, nodeIndex, start,
                            dir = simple !== forward ? "nextSibling" : "previousSibling",
                            parent = elem.parentNode,
                            name = ofType && elem.nodeName.toLowerCase(),
                            useCache = !xml && !ofType;

                        if (parent) {

                            // :(first|last|only)-(child|of-type)
                            if (simple) {
                                while (dir) {
                                    node = elem;
                                    while ((node = node[ dir ])) {
                                        if (ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) {
                                            return false;
                                        }
                                    }
                                    // Reverse direction for :only-* (if we haven't yet done so)
                                    start = dir = type === "only" && !start && "nextSibling";
                                }
                                return true;
                            }

                            start = [ forward ? parent.firstChild : parent.lastChild ];

                            // non-xml :nth-child(...) stores cache data on `parent`
                            if (forward && useCache) {
                                // Seek `elem` from a previously-cached index
                                outerCache = parent[ expando ] || (parent[ expando ] = {});
                                cache = outerCache[ type ] || [];
                                nodeIndex = cache[0] === dirruns && cache[1];
                                diff = cache[0] === dirruns && cache[2];
                                node = nodeIndex && parent.childNodes[ nodeIndex ];

                                while ((node = ++nodeIndex && node && node[ dir ] ||

                                    // Fallback to seeking `elem` from the start
                                    (diff = nodeIndex = 0) || start.pop())) {

                                    // When found, cache indexes on `parent` and break
                                    if (node.nodeType === 1 && ++diff && node === elem) {
                                        outerCache[ type ] = [ dirruns, nodeIndex, diff ];
                                        break;
                                    }
                                }

                                // Use previously-cached element index if available
                            } else if (useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns) {
                                diff = cache[1];

                                // xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
                            } else {
                                // Use the same loop as above to seek `elem` from the start
                                while ((node = ++nodeIndex && node && node[ dir ] ||
                                    (diff = nodeIndex = 0) || start.pop())) {

                                    if (( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff) {
                                        // Cache the index of each encountered element
                                        if (useCache) {
                                            (node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
                                        }

                                        if (node === elem) {
                                            break;
                                        }
                                    }
                                }
                            }

                            // Incorporate the offset, then check against cycle size
                            diff -= last;
                            return diff === first || ( diff % first === 0 && diff / first >= 0 );
                        }
                    };
            },

            "PSEUDO": function (pseudo, argument) {
                // pseudo-class names are case-insensitive
                // http://www.w3.org/TR/selectors/#pseudo-classes
                // Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
                // Remember that setFilters inherits from pseudos
                var args,
                    fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
                        Sizzle.error("unsupported pseudo: " + pseudo);

                // The user may use createPseudo to indicate that
                // arguments are needed to create the filter function
                // just as Sizzle does
                if (fn[ expando ]) {
                    return fn(argument);
                }

                // But maintain support for old signatures
                if (fn.length > 1) {
                    args = [ pseudo, pseudo, "", argument ];
                    return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ?
                        markFunction(function (seed, matches) {
                            var idx,
                                matched = fn(seed, argument),
                                i = matched.length;
                            while (i--) {
                                idx = indexOf.call(seed, matched[i]);
                                seed[ idx ] = !( matches[ idx ] = matched[i] );
                            }
                        }) :
                        function (elem) {
                            return fn(elem, 0, args);
                        };
                }

                return fn;
            }
        },

        pseudos: {
            // Potentially complex pseudos
            "not": markFunction(function (selector) {
                // Trim the selector passed to compile
                // to avoid treating leading and trailing
                // spaces as combinators
                var input = [],
                    results = [],
                    matcher = compile(selector.replace(rtrim, "$1"));

                return matcher[ expando ] ?
                    markFunction(function (seed, matches, context, xml) {
                        var elem,
                            unmatched = matcher(seed, null, xml, []),
                            i = seed.length;

                        // Match elements unmatched by `matcher`
                        while (i--) {
                            if ((elem = unmatched[i])) {
                                seed[i] = !(matches[i] = elem);
                            }
                        }
                    }) :
                    function (elem, context, xml) {
                        input[0] = elem;
                        matcher(input, null, xml, results);
                        return !results.pop();
                    };
            }),

            "has": markFunction(function (selector) {
                return function (elem) {
                    return Sizzle(selector, elem).length > 0;
                };
            }),

            "contains": markFunction(function (text) {
                return function (elem) {
                    return ( elem.textContent || elem.innerText || getText(elem) ).indexOf(text) > -1;
                };
            }),

            // "Whether an element is represented by a :lang() selector
            // is based solely on the element's language value
            // being equal to the identifier C,
            // or beginning with the identifier C immediately followed by "-".
            // The matching of C against the element's language value is performed case-insensitively.
            // The identifier C does not have to be a valid language name."
            // http://www.w3.org/TR/selectors/#lang-pseudo
            "lang": markFunction(function (lang) {
                // lang value must be a valid identifier
                if (!ridentifier.test(lang || "")) {
                    Sizzle.error("unsupported lang: " + lang);
                }
                lang = lang.replace(runescape, funescape).toLowerCase();
                return function (elem) {
                    var elemLang;
                    do {
                        if ((elemLang = documentIsHTML ?
                            elem.lang :
                            elem.getAttribute("xml:lang") || elem.getAttribute("lang"))) {

                            elemLang = elemLang.toLowerCase();
                            return elemLang === lang || elemLang.indexOf(lang + "-") === 0;
                        }
                    } while ((elem = elem.parentNode) && elem.nodeType === 1);
                    return false;
                };
            }),

            // Miscellaneous
            "target": function (elem) {
                var hash = window.location && window.location.hash;
                return hash && hash.slice(1) === elem.id;
            },

            "root": function (elem) {
                return elem === docElem;
            },

            "focus": function (elem) {
                return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
            },

            // Boolean properties
            "enabled": function (elem) {
                return elem.disabled === false;
            },

            "disabled": function (elem) {
                return elem.disabled === true;
            },

            "checked": function (elem) {
                // In CSS3, :checked should return both checked and selected elements
                // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
                var nodeName = elem.nodeName.toLowerCase();
                return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
            },

            "selected": function (elem) {
                // Accessing this property makes selected-by-default
                // options in Safari work properly
                if (elem.parentNode) {
                    elem.parentNode.selectedIndex;
                }

                return elem.selected === true;
            },

            // Contents
            "empty": function (elem) {
                // http://www.w3.org/TR/selectors/#empty-pseudo
                // :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
                //   but not by others (comment: 8; processing instruction: 7; etc.)
                // nodeType < 6 works because attributes (2) do not appear as children
                for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                    if (elem.nodeType < 6) {
                        return false;
                    }
                }
                return true;
            },

            "parent": function (elem) {
                return !Expr.pseudos["empty"](elem);
            },

            // Element/input types
            "header": function (elem) {
                return rheader.test(elem.nodeName);
            },

            "input": function (elem) {
                return rinputs.test(elem.nodeName);
            },

            "button": function (elem) {
                var name = elem.nodeName.toLowerCase();
                return name === "input" && elem.type === "button" || name === "button";
            },

            "text": function (elem) {
                var attr;
                return elem.nodeName.toLowerCase() === "input" &&
                    elem.type === "text" &&

                    // Support: IE<8
                    // New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
                    ( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
            },

            // Position-in-collection
            "first": createPositionalPseudo(function () {
                return [ 0 ];
            }),

            "last": createPositionalPseudo(function (matchIndexes, length) {
                return [ length - 1 ];
            }),

            "eq": createPositionalPseudo(function (matchIndexes, length, argument) {
                return [ argument < 0 ? argument + length : argument ];
            }),

            "even": createPositionalPseudo(function (matchIndexes, length) {
                var i = 0;
                for (; i < length; i += 2) {
                    matchIndexes.push(i);
                }
                return matchIndexes;
            }),

            "odd": createPositionalPseudo(function (matchIndexes, length) {
                var i = 1;
                for (; i < length; i += 2) {
                    matchIndexes.push(i);
                }
                return matchIndexes;
            }),

            "lt": createPositionalPseudo(function (matchIndexes, length, argument) {
                var i = argument < 0 ? argument + length : argument;
                for (; --i >= 0;) {
                    matchIndexes.push(i);
                }
                return matchIndexes;
            }),

            "gt": createPositionalPseudo(function (matchIndexes, length, argument) {
                var i = argument < 0 ? argument + length : argument;
                for (; ++i < length;) {
                    matchIndexes.push(i);
                }
                return matchIndexes;
            })
        }
    };

    Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
    for (i in { radio: true, checkbox: true, file: true, password: true, image: true }) {
        Expr.pseudos[ i ] = createInputPseudo(i);
    }
    for (i in { submit: true, reset: true }) {
        Expr.pseudos[ i ] = createButtonPseudo(i);
    }

// Easy API for creating new setFilters
    function setFilters() {
    }

    setFilters.prototype = Expr.filters = Expr.pseudos;
    Expr.setFilters = new setFilters();

    function tokenize(selector, parseOnly) {
        var matched, match, tokens, type,
            soFar, groups, preFilters,
            cached = tokenCache[ selector + " " ];

        if (cached) {
            return parseOnly ? 0 : cached.slice(0);
        }

        soFar = selector;
        groups = [];
        preFilters = Expr.preFilter;

        while (soFar) {

            // Comma and first run
            if (!matched || (match = rcomma.exec(soFar))) {
                if (match) {
                    // Don't consume trailing commas as valid
                    soFar = soFar.slice(match[0].length) || soFar;
                }
                groups.push((tokens = []));
            }

            matched = false;

            // Combinators
            if ((match = rcombinators.exec(soFar))) {
                matched = match.shift();
                tokens.push({
                    value: matched,
                    // Cast descendant combinators to space
                    type: match[0].replace(rtrim, " ")
                });
                soFar = soFar.slice(matched.length);
            }

            // Filters
            for (type in Expr.filter) {
                if ((match = matchExpr[ type ].exec(soFar)) && (!preFilters[ type ] ||
                    (match = preFilters[ type ](match)))) {
                    matched = match.shift();
                    tokens.push({
                        value: matched,
                        type: type,
                        matches: match
                    });
                    soFar = soFar.slice(matched.length);
                }
            }

            if (!matched) {
                break;
            }
        }

        // Return the length of the invalid excess
        // if we're just parsing
        // Otherwise, throw an error or return tokens
        return parseOnly ?
            soFar.length :
            soFar ?
                Sizzle.error(selector) :
                // Cache the tokens
                tokenCache(selector, groups).slice(0);
    }

    function toSelector(tokens) {
        var i = 0,
            len = tokens.length,
            selector = "";
        for (; i < len; i++) {
            selector += tokens[i].value;
        }
        return selector;
    }

    function addCombinator(matcher, combinator, base) {
        var dir = combinator.dir,
            checkNonElements = base && dir === "parentNode",
            doneName = done++;

        return combinator.first ?
            // Check against closest ancestor/preceding element
            function (elem, context, xml) {
                while ((elem = elem[ dir ])) {
                    if (elem.nodeType === 1 || checkNonElements) {
                        return matcher(elem, context, xml);
                    }
                }
            } :

            // Check against all ancestor/preceding elements
            function (elem, context, xml) {
                var oldCache, outerCache,
                    newCache = [ dirruns, doneName ];

                // We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
                if (xml) {
                    while ((elem = elem[ dir ])) {
                        if (elem.nodeType === 1 || checkNonElements) {
                            if (matcher(elem, context, xml)) {
                                return true;
                            }
                        }
                    }
                } else {
                    while ((elem = elem[ dir ])) {
                        if (elem.nodeType === 1 || checkNonElements) {
                            outerCache = elem[ expando ] || (elem[ expando ] = {});
                            if ((oldCache = outerCache[ dir ]) &&
                                oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName) {

                                // Assign to newCache so results back-propagate to previous elements
                                return (newCache[ 2 ] = oldCache[ 2 ]);
                            } else {
                                // Reuse newcache so results back-propagate to previous elements
                                outerCache[ dir ] = newCache;

                                // A match means we're done; a fail means we have to keep checking
                                if ((newCache[ 2 ] = matcher(elem, context, xml))) {
                                    return true;
                                }
                            }
                        }
                    }
                }
            };
    }

    function elementMatcher(matchers) {
        return matchers.length > 1 ?
            function (elem, context, xml) {
                var i = matchers.length;
                while (i--) {
                    if (!matchers[i](elem, context, xml)) {
                        return false;
                    }
                }
                return true;
            } :
            matchers[0];
    }

    function multipleContexts(selector, contexts, results) {
        var i = 0,
            len = contexts.length;
        for (; i < len; i++) {
            Sizzle(selector, contexts[i], results);
        }
        return results;
    }

    function condense(unmatched, map, filter, context, xml) {
        var elem,
            newUnmatched = [],
            i = 0,
            len = unmatched.length,
            mapped = map != null;

        for (; i < len; i++) {
            if ((elem = unmatched[i])) {
                if (!filter || filter(elem, context, xml)) {
                    newUnmatched.push(elem);
                    if (mapped) {
                        map.push(i);
                    }
                }
            }
        }

        return newUnmatched;
    }

    function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
        if (postFilter && !postFilter[ expando ]) {
            postFilter = setMatcher(postFilter);
        }
        if (postFinder && !postFinder[ expando ]) {
            postFinder = setMatcher(postFinder, postSelector);
        }
        return markFunction(function (seed, results, context, xml) {
            var temp, i, elem,
                preMap = [],
                postMap = [],
                preexisting = results.length,

            // Get initial elements from seed or context
                elems = seed || multipleContexts(selector || "*", context.nodeType ? [ context ] : context, []),

            // Prefilter to get matcher input, preserving a map for seed-results synchronization
                matcherIn = preFilter && ( seed || !selector ) ?
                    condense(elems, preMap, preFilter, context, xml) :
                    elems,

                matcherOut = matcher ?
                    // If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
                    postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

                        // ...intermediate processing is necessary
                        [] :

                        // ...otherwise use results directly
                        results :
                    matcherIn;

            // Find primary matches
            if (matcher) {
                matcher(matcherIn, matcherOut, context, xml);
            }

            // Apply postFilter
            if (postFilter) {
                temp = condense(matcherOut, postMap);
                postFilter(temp, [], context, xml);

                // Un-match failing elements by moving them back to matcherIn
                i = temp.length;
                while (i--) {
                    if ((elem = temp[i])) {
                        matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
                    }
                }
            }

            if (seed) {
                if (postFinder || preFilter) {
                    if (postFinder) {
                        // Get the final matcherOut by condensing this intermediate into postFinder contexts
                        temp = [];
                        i = matcherOut.length;
                        while (i--) {
                            if ((elem = matcherOut[i])) {
                                // Restore matcherIn since elem is not yet a final match
                                temp.push((matcherIn[i] = elem));
                            }
                        }
                        postFinder(null, (matcherOut = []), temp, xml);
                    }

                    // Move matched elements from seed to results to keep them synchronized
                    i = matcherOut.length;
                    while (i--) {
                        if ((elem = matcherOut[i]) &&
                            (temp = postFinder ? indexOf.call(seed, elem) : preMap[i]) > -1) {

                            seed[temp] = !(results[temp] = elem);
                        }
                    }
                }

                // Add elements to results, through postFinder if defined
            } else {
                matcherOut = condense(
                    matcherOut === results ?
                        matcherOut.splice(preexisting, matcherOut.length) :
                        matcherOut
                );
                if (postFinder) {
                    postFinder(null, results, matcherOut, xml);
                } else {
                    push.apply(results, matcherOut);
                }
            }
        });
    }

    function matcherFromTokens(tokens) {
        var checkContext, matcher, j,
            len = tokens.length,
            leadingRelative = Expr.relative[ tokens[0].type ],
            implicitRelative = leadingRelative || Expr.relative[" "],
            i = leadingRelative ? 1 : 0,

        // The foundational matcher ensures that elements are reachable from top-level context(s)
            matchContext = addCombinator(function (elem) {
                return elem === checkContext;
            }, implicitRelative, true),
            matchAnyContext = addCombinator(function (elem) {
                return indexOf.call(checkContext, elem) > -1;
            }, implicitRelative, true),
            matchers = [ function (elem, context, xml) {
                return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
                    (checkContext = context).nodeType ?
                        matchContext(elem, context, xml) :
                        matchAnyContext(elem, context, xml) );
            } ];

        for (; i < len; i++) {
            if ((matcher = Expr.relative[ tokens[i].type ])) {
                matchers = [ addCombinator(elementMatcher(matchers), matcher) ];
            } else {
                matcher = Expr.filter[ tokens[i].type ].apply(null, tokens[i].matches);

                // Return special upon seeing a positional matcher
                if (matcher[ expando ]) {
                    // Find the next relative operator (if any) for proper handling
                    j = ++i;
                    for (; j < len; j++) {
                        if (Expr.relative[ tokens[j].type ]) {
                            break;
                        }
                    }
                    return setMatcher(
                        i > 1 && elementMatcher(matchers),
                        i > 1 && toSelector(
                            // If the preceding token was a descendant combinator, insert an implicit any-element `*`
                            tokens.slice(0, i - 1).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
                        ).replace(rtrim, "$1"),
                        matcher,
                        i < j && matcherFromTokens(tokens.slice(i, j)),
                        j < len && matcherFromTokens((tokens = tokens.slice(j))),
                        j < len && toSelector(tokens)
                    );
                }
                matchers.push(matcher);
            }
        }

        return elementMatcher(matchers);
    }

    function matcherFromGroupMatchers(elementMatchers, setMatchers) {
        var bySet = setMatchers.length > 0,
            byElement = elementMatchers.length > 0,
            superMatcher = function (seed, context, xml, results, outermost) {
                var elem, j, matcher,
                    matchedCount = 0,
                    i = "0",
                    unmatched = seed && [],
                    setMatched = [],
                    contextBackup = outermostContext,
                // We must always have either seed elements or outermost context
                    elems = seed || byElement && Expr.find["TAG"]("*", outermost),
                // Use integer dirruns iff this is the outermost matcher

                    dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),

                    len = elems.length;

                if (outermost) {
                    outermostContext = context !== document && context;
                }

                // Add elements passing elementMatchers directly to results
                // Keep `i` a string if there are no elements so `matchedCount` will be "00" below
                // Support: IE<9, Safari
                // Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
                for (; i !== len && (elem = elems[i]) != null; i++) {
                    if (byElement && elem) {
                        j = 0;
                        while ((matcher = elementMatchers[j++])) {
                            if (matcher(elem, context, xml)) {
                                results.push(elem);
                                break;
                            }
                        }
                        if (outermost) {
                            dirruns = dirrunsUnique;
                        }
                    }

                    // Track unmatched elements for set filters
                    if (bySet) {
                        // They will have gone through all possible matchers
                        if ((elem = !matcher && elem)) {
                            matchedCount--;
                        }

                        // Lengthen the array for every element, matched or not
                        if (seed) {
                            unmatched.push(elem);
                        }
                    }
                }

                // Apply set filters to unmatched elements
                matchedCount += i;
                if (bySet && i !== matchedCount) {
                    j = 0;
                    while ((matcher = setMatchers[j++])) {
                        matcher(unmatched, setMatched, context, xml);
                    }

                    if (seed) {
                        // Reintegrate element matches to eliminate the need for sorting
                        if (matchedCount > 0) {
                            while (i--) {
                                if (!(unmatched[i] || setMatched[i])) {
                                    setMatched[i] = pop.call(results);
                                }
                            }
                        }

                        // Discard index placeholder values to get only actual matches
                        setMatched = condense(setMatched);
                    }

                    // Add matches to results
                    push.apply(results, setMatched);

                    // Seedless set matches succeeding multiple successful matchers stipulate sorting
                    if (outermost && !seed && setMatched.length > 0 &&
                        ( matchedCount + setMatchers.length ) > 1) {

                        Sizzle.uniqueSort(results);
                    }
                }

                // Override manipulation of globals by nested matchers
                if (outermost) {
                    dirruns = dirrunsUnique;
                    outermostContext = contextBackup;
                }

                return unmatched;
            };

        return bySet ?
            markFunction(superMatcher) :
            superMatcher;
    }

    compile = Sizzle.compile = function (selector, match /* Internal Use Only */) {
        var i,
            setMatchers = [],
            elementMatchers = [],
            cached = compilerCache[ selector + " " ];

        if (!cached) {
            // Generate a function of recursive functions that can be used to check each element
            if (!match) {
                match = tokenize(selector);
            }
            i = match.length;
            while (i--) {
                cached = matcherFromTokens(match[i]);
                if (cached[ expando ]) {
                    setMatchers.push(cached);
                } else {
                    elementMatchers.push(cached);
                }
            }

            // Cache the compiled function
            cached = compilerCache(selector, matcherFromGroupMatchers(elementMatchers, setMatchers));

            // Save selector and tokenization
            cached.selector = selector;
        }
        return cached;
    };

    /**
     * A low-level selection function that works with Sizzle's compiled
     *  selector functions
     * @param {String|Function} selector A selector or a pre-compiled
     *  selector function built with Sizzle.compile
     * @param {Element} context
     * @param {Array} [results]
     * @param {Array} [seed] A set of elements to match against
     */
    select = Sizzle.select = function (selector, context, results, seed) {
        var i, tokens, token, type, find,
            compiled = typeof selector === "function" && selector,
            match = !seed && tokenize((selector = compiled.selector || selector));

        results = results || [];

        // Try to minimize operations if there is no seed and only one group
        if (match.length === 1) {

            // Take a shortcut and set the context if the root selector is an ID
            tokens = match[0] = match[0].slice(0);
            if (tokens.length > 2 && (token = tokens[0]).type === "ID" &&
                support.getById && context.nodeType === 9 && documentIsHTML &&
                Expr.relative[ tokens[1].type ]) {

                context = ( Expr.find["ID"](token.matches[0].replace(runescape, funescape), context) || [] )[0];
                if (!context) {
                    return results;

                    // Precompiled matchers will still verify ancestry, so step up a level
                } else if (compiled) {
                    context = context.parentNode;
                }

                selector = selector.slice(tokens.shift().value.length);
            }

            // Fetch a seed set for right-to-left matching
            i = matchExpr["needsContext"].test(selector) ? 0 : tokens.length;
            while (i--) {
                token = tokens[i];

                // Abort if we hit a combinator
                if (Expr.relative[ (type = token.type) ]) {
                    break;
                }
                if ((find = Expr.find[ type ])) {
                    // Search, expanding context for leading sibling combinators
                    if ((seed = find(
                        token.matches[0].replace(runescape, funescape),
                        rsibling.test(tokens[0].type) && testContext(context.parentNode) || context
                    ))) {

                        // If seed is empty or no tokens remain, we can return early
                        tokens.splice(i, 1);
                        selector = seed.length && toSelector(tokens);
                        if (!selector) {
                            push.apply(results, seed);
                            return results;
                        }

                        break;
                    }
                }
            }
        }

        // Compile and execute a filtering function if one is not provided
        // Provide `match` to avoid retokenization if we modified the selector above
        ( compiled || compile(selector, match) )(
            seed,
            context,
            !documentIsHTML,
            results,
            rsibling.test(selector) && testContext(context.parentNode) || context
        );
        return results;
    };

// One-time assignments

// Sort stability
    support.sortStable = expando.split("").sort(sortOrder).join("") === expando;

// Support: Chrome<14
// Always assume duplicates if they aren't passed to the comparison function
    support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
    setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
    support.sortDetached = assert(function (div1) {
        // Should return 1, but returns 4 (following)
        return div1.compareDocumentPosition(document.createElement("div")) & 1;
    });

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
    if (!assert(function (div) {
        div.innerHTML = "<a href='#'></a>";
        return div.firstChild.getAttribute("href") === "#";
    })) {
        addHandle("type|href|height|width", function (elem, name, isXML) {
            if (!isXML) {
                return elem.getAttribute(name, name.toLowerCase() === "type" ? 1 : 2);
            }
        });
    }

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
    if (!support.attributes || !assert(function (div) {
        div.innerHTML = "<input/>";
        div.firstChild.setAttribute("value", "");
        return div.firstChild.getAttribute("value") === "";
    })) {
        addHandle("value", function (elem, name, isXML) {
            if (!isXML && elem.nodeName.toLowerCase() === "input") {
                return elem.defaultValue;
            }
        });
    }

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
    if (!assert(function (div) {
        return div.getAttribute("disabled") == null;
    })) {
        addHandle(booleans, function (elem, name, isXML) {
            var val;
            if (!isXML) {
                return elem[ name ] === true ? name.toLowerCase() :
                    (val = elem.getAttributeNode(name)) && val.specified ?
                        val.value :
                        null;
            }
        });
    }

// EXPOSE
    if (typeof define === "function" && define.amd) {
        define(function () {
            return Sizzle;
        });
// Sizzle requires that there be a global window in Common-JS like environments
    } else if (typeof module !== "undefined" && module.exports) {
        module.exports = Sizzle;
    } else {
        window.Sizzle = Sizzle;
    }
// EXPOSE
})(window);


//gearself
(function () {
    var facade = {
        'cursorPosition': function (event) {
            if (typeof event.pageX !== 'undefined') {
                facade.cursorPosition = function (event) {
                    return [event.pageX, event.pageY];
                }
            } else {
                facade.cursorPosition = function (event) {
                    var scroll = $(window).scroll();
                    console.log('clientx');
                    return [event.clientX + scroll[0], event.clientY + scroll[1]];
                }
            }
            return facade.cursorPosition(event);
        },
        'viewportSize': function () {
            if (typeof window.innerWidth !== 'undefined') {
                facade.viewportSize = function () {
                    return [window.innerWidth, window.innerHeight];
                }
            } else {
                var el = document.documentElement;
                if (el !== 'undefined' && typeof el.clientWidth !== 'undefined' && el.clientWidth != 0) {
                    facade.viewportSize = function () {
                        return [el.clientWidth, el.clientHeight];
                    }
                } else {
                    var body = document.body;
                    facade.viewportSize = function () {
                        return [body.clientWidth, body.clientHeight];
                    }
                }
            }
            return facade.viewportSize();
        },
        'scrollPosition': function (dom) {
            if (typeof window.pageYOffset !== 'undefined') {
                facade.scrollPosition = function (dom) {
                    if (dom === window) {
                        return [window.pageXOffset, window.pageYOffset];
                    } else {
                        return [dom.scrollLeft, dom.scrollTop];
                    }
                }
            } else {
                var el = document.documentElement;
                if (typeof el.scrollTop !== 'undefined' && el.scrollTop > 0
                    || el.scrollLeft > 0) {
                    facade.scrollPosition = function (dom) {
                        if (dom === window) {
                            return [el.scrollLeft, el.scrollTop];
                        } else {
                            return [dom.scrollLeft, dom.scrollTop];
                        }
                    }
                } else {
                    var body = document.body;
                    if (typeof body.scrollTop !== 'undefined') {
                        facade.scrollPosition = function (dom) {
                            if (dom === window) {
                                return [body.scrollLeft, body.scrollTop];
                            } else {
                                return [dom.scrollLeft, dom.scrollTop];
                            }
                        }
                    }
                }
            }
            return facade.scrollPosition(dom);
        },
        'live': function (dom, name, callback) {

        },
        'on': function (dom, name, callback) {
            if ('addEventListener' in window) {
                facade.on = function (dom, name, callback) {
                    var handler = function (event) {
                        callback.call(dom, $.fixEvent(event));
                    };
                    if (name == 'blur' || name == 'focus' || (name == 'change' && dom.nodeName.toLowerCase() !== 'select')) {
                        dom.addEventListener(name, handler, true);
                    } else {
                        dom.addEventListener(name, handler, false);
                    }
                    return handler;
                };
            } else if ('attachEvent' in window) {
                facade.on = function (dom, name, callback) {
                    var handler = function (event) {
                        callback.call(dom, $.fixEvent(event));
                    };
                    //ie
                    if (name == 'change' && dom.nodeName.toLowerCase() !== 'select') {

                    } else {
                        if (name == 'blur') {
                            name = 'focusout';
                        } else if (name == 'focus') {
                            name = 'focusin';
                        }
                        dom.attachEvent('on' + name, handler);
                    }
                    return handler;
                }
            } else {
                facade.on = function (dom, name, callback) {
                    var handler = function (event) {
                        callback.call(dom, $.fixEvent(event));
                    };
                    //ie
                    if (name == 'blur') {
                        name = 'focusout';
                    } else if (name == 'focus') {
                        name = 'focusin';
                    }
                    dom['on' + name] = handler;
                    return handler;
                }
            }
            return this.on(dom, name, callback);
        },
        'off': function (dom, name, callback) {
            if ('removeEventListener' in window) {
                facade.off = function (dom, name, callback) {
                    if (name == 'blur' || name == 'focus' || (name == 'change' && dom.nodeName.toLowerCase() !== 'select')) {
                        dom.removeEventListener(name, callback, true);
                    } else {
                        dom.removeEventListener(name, callback, false);
                    }
                };
            } else if ('detachEvent' in window) {
                facade.off = function (dom, name, callback) {

                    dom.detachEvent('on' + name, callback);
                }
            } else {
                facade.off = function (dom, name, callback) {
                    if (callback === dom['on' + name]) {
                        dom['on' + name] = null;
                    }
                }
            }
            this.off(dom, name, callback);
        },
        'once': function (dom, name, callback) {
            var handler = facade.on(dom, name, function (event) {
                callback(event);
                facade.off(dom, name, handler);
            });
        },
        'domContentLoaded': function (fn) {
            if ('addEventListener' in window) {
                facade.domContentLoaded = function (fn) {
                    var handler = facade.on(document, 'DOMContentLoaded', function () {
                        fn.each(function () {
                            this();
                        });
                        facade.off(document, 'DOMContentLoaded', handler);
                    });
                };
            } else if ('attachEvent' in window) {
                facade.domContentLoaded = function (fn) {
                    var handler = facade.on(window, 'load', function () {
                        fn.each(function () {
                            this();
                        });
                        facade.off(window, 'load', handler);
                    });
                }
            } else {
                facade.domContentLoaded = function (fn) {
                    var handler = facade.on(window, 'load', function () {
                        fn.each(function () {
                            this();
                        });
                        facade.off(window, 'load', handler);
                    });
                }
            }
            facade.domContentLoaded(fn);
        },
        'css': function (base, attr, value) {
            if (typeof window.getComputedStyle != 'undefined')//W3C
            {
                facade.css = function (base, attr, value) {
                    if (value !== undefined) {
                        base.each(function () {
                            this.style[attr] = value;
                        });
                        return value;
                    } else {
                        return window.getComputedStyle(base[0], null)[attr];
                    }
                };
            }
            else if (typeof base[0].currentStyle != 'undefined') {
                facade.css = function (base, attr, value) {
                    if (value !== undefined) {
                        base.each(function () {
                            this.style[attr] = value;
                        });
                        return value;
                    } else {
                        return base[0].currentStyle[attr];
                    }
                };
            }
            return facade.css(base, attr, value);
        },
        'opacity': function (base, value) {

            if (value !== undefined) {
                base.each(function () {
                    this.style['opacity'] = value;
                    this.style.filter = "alpha(opacity=" + parseInt(100 * value) + ")";
                });
                return value;
            } else {
                return base.css("opacity");
            }
        }
    }

    var animator = {
        fixUpdater: function (config) {
            var updater = config.updater || "line";
            if (typeof updater === 'function') {
                return;
            }
            if (updater in animator.updater) {
                config.updater = animator.updater[updater];
            } else {
                config.updater = animator.updater['line'];
            }
        },
        updater: {
            line: function (offset, currentStep, step) {
                return offset / step * currentStep;
            },
            sin: function (offset, currentStep, step) {
                return Math.sin(Math.PI / 2 * currentStep / step) * offset;
            }
        },
        parser: function (config) {
            var attr = config.attr;
            var $animator;
            switch (attr) {
                case 'x':
                    attr = 'left';
                    $animator = animator.pxAnimator;
                    break;
                case 'y':
                    attr = 'top';
                    $animator = animator.pxAnimator;
                    break;
                case 'w':
                    attr = 'width';
                    $animator = animator.pxAnimator;
                    break;
                case 'h':
                    attr = 'height';
                    $animator = animator.pxAnimator;
                    break;
                case 'o':
                    attr = 'opacity';
                    $animator = animator.opacityAnimator;
                    break;
                case 'c':
                    attr = 'color';
                    $animator = animator.colorAnimator;
                    break;
                case 'b':
                    attr = 'backgroundColor';
                    $animator = animator.colorAnimator;
                    break;
                case 's':
                    attr = "clip";
                    $animator = animator.clipAnimator;
                    break;
                default :
                    console.log(attr);
                    $animator = animator.pxAnimator;
                    break;
            }
            config.attr = attr;
            return $animator;
        },
        $handler: function (config) {
            var items = config.items;
            items.each(function () {
                var $animator = this.$animator;
                animator.fixUpdater(this);
                $animator.init.call(this.base, this, config.step);
            });
            var step = 0;
            var timer = setInterval(function () {
                step++;
                items.each(function () {
                    var $animator = this.$animator;
                    $animator.update.call(this.base, this, step);
                });
                if (step >= config.step) {
                    clearInterval(timer);
                    if ('callback' in config) {
                        config.callback();
                    }
                }
            }, config['interval']);
        },
        handler: function (obj, key, emitter, scope, interval) {
            var that = this;
            animator.fixUpdater(obj);
            scope.init.call(that, obj, obj.step);
            var step = 0;
            var timer = setInterval(function () {
                step++;
                scope.update.call(that, obj, step);
                if (step >= obj.step) {
                    clearInterval(timer);
                    if ("callback" in obj) {
                        obj.callback();
                    }
                    emitter.emit(key);
                }
            }, interval);
        },
        pxAnimator: {
            init: function (obj, step) {
                var position = obj['from'];
                if (position !== undefined) {
                    this.each(function () {
                        this.style[obj.attr] = obj.from + "px";
                    });
                    obj.offset = parseFloat(obj.to - obj.from);
                } else {
                    obj.from = [];
                    obj.offset = [];

                    this.each(function () {
                        var from = parseInt($(this).css(obj['attr']));
                        from = from || 0;
                        obj.from.push(from);
                        obj.offset.push(parseFloat(obj.to - from));

                    });
                }
            },
            update: function (obj, step) {
                this.each(function (index) {
                    if (obj.from instanceof Array) {
                        this.style[obj['attr']] = (obj.from[index] + obj.updater(obj['offset'][index], step, obj.step)) + 'px';
                    } else {
                        this.style[obj['attr']] = (obj.from + obj.updater(obj['offset'], step, obj.step)) + 'px';
                    }
                });
            }
        },
        clipAnimator: {
            init: function (obj, step) {
                var to = obj.to;
                obj.to = [to[1], to[2], to[3], to[0]];

                var position = obj['from'];
                if (position !== undefined) {
                    position = [position[1], position[2], position[3], position[0]];
                    obj['from'] = position;
                    this.each(function () {
                        this.style[obj.attr] = "rect(" + position[0] + "px," + position[1] + "px," + position[2] + "px," + position[3] + "px)";
                    });
                    obj.offset = [parseFloat(obj.to[0] - obj.from[0]), parseFloat(obj.to[1] - obj.from[1]), parseFloat(obj.to[2] - obj.from[2]), parseFloat(obj.to[3] - obj.from[3])];
                } else {
                    obj.from = [];
                    obj.offset = [];

                    this.each(function () {
                        var clipValue = $(this).css(obj['attr']);
                        if (!clipValue || clipValue === 'auto') {
                            var size = $(this).size();
                            clipValue = [0, parseInt(size[0]), parseInt(size[1]), 0];
                        } else {
                            clipValue = clipValue.replace(regexMap.rect, "$1");
                            if (/,/.test(clipValue)) {
                                clipValue = clipValue.split(",");
                            } else {
                                clipValue = clipValue.split(" ");
                            }
                            clipValue.each(function (index) {
                                clipValue[index] = parseInt(clipValue[index]);
                            });
                        }
                        var from = clipValue;
                        obj.from.push(from);
                        obj.offset.push([parseFloat(obj.to[0] - from[0]), parseFloat(obj.to[1] - from[1]), parseFloat(obj.to[2] - from[2]), parseFloat(obj.to[3] - from[3])]);

                    });
                }
            },
            update: function (obj, step) {
                this.each(function (index) {
                    var updater = obj.updater;
                    if (obj.from[0] instanceof Array) {
                        var from = obj.from[index];
                        var offset = obj.offset[index];
                        this.style[obj['attr']] = "rect(" + (from[0] + updater(offset[0], step, obj.step)) + "px," + (from[1] + updater(offset[1], step, obj.step)) + "px," + (from[2] + updater(offset[2], step, obj.step)) + "px," + (from[3] + updater(offset[3], step, obj.step)) + "px)";
                    } else {
                        var from = obj.from;
                        var offset = obj.offset;
                        this.style[obj['attr']] = "rect(" + (from[0] + updater(offset[0], step, obj.step)) + "px," + (from[1] + updater(offset[1], step, obj.step)) + "px," + (from[2] + updater(offset[2], step, obj.step)) + "px," + (from[3] + updater(offset[3], step, obj.step)) + "px)";
                    }
                });
            }
        },
        opacityAnimator: {

            init: function (obj, step) {
                var position = obj['from'];
                if (position !== undefined) {
                    this.each(function () {
                        $(this).opacity(obj.from);
                    });
                    obj.offset = parseFloat(obj.to - obj.from);
                } else {
                    obj.from = [];
                    obj.offset = [];
                    this.each(function () {
                        var from = parseInt($(this).css(obj['attr']));
                        from = from || 0;
                        obj.from.push(from);
                        obj.offset.push(parseFloat(obj.to - from));
                    });
                }
            },
            update: function (obj, step) {
                this.each(function (index) {
                    if (obj.from instanceof Array) {
                        $(this).opacity(obj.from[index] + obj.updater(obj['offset'][index], step, obj.step));
                    } else {
                        $(this).opacity(obj.from + obj.updater(obj['offset'], step, obj.step));
                    }
                });
            }
        },
        colorAnimator: {

            init: function (obj, step) {
                var position = obj['from'];

                if (position !== undefined) {
                    this.each(function () {
                        $(this).css(obj.attr, obj.from);
                    });

                    var from = HexToRGB(obj.from);
                    var to = HexToRGB(obj.to);
                    obj.rgbFrom = from;
                    obj.offset = [(to[0] - from[0]), (to[1] - from[1]), (to[2] - from[2])];

                } else {
                    obj.rgbFrom = [];
                    obj.offset = [];
                    var to = HexToRGB(obj.to);
                    this.each(function () {
                        var from = $(this).css(obj['attr']);
                        from = from || 'transparent';
                        from = HexToRGB(from);
                        obj.rgbFrom.push(from);
                        obj.offset.push([(to[0] - from[0]), (to[1] - from[1]), (to[2] - from[2])]);
                    });

                }
            },
            update: function (obj, step) {
                var re, color;
                this.each(function (index) {
                    var updater = obj.updater;
                    if (obj.rgbFrom[0] instanceof Array) {
                        var offset = obj.offset[index];
                        var from = obj.rgbFrom[index];
                        re = [parseInt(from[0] + updater(offset[0], step, obj.step)), parseInt(from[1] + updater(offset[1], step, obj.step)), parseInt(from[2] + updater(offset[2], step, obj.step))];

                    } else {
                        var offset = obj.offset;
                        var from = obj.rgbFrom;
                        re = [parseInt(from[0] + updater(offset[0], step, obj.step)), parseInt(from[1] + updater(offset[1], step, obj.step)), parseInt(from[2] + updater(offset[2], step, obj.step))];
                    }

                    color = RGBToHex(re);

                    $(this).css(obj.attr, color);
                });
            }
        }
    };
    var regexMap = {
        color: /^#([0-9a-fA-F]{1,2})([0-9a-fA-F]{1,2})([0-9a-fA-F]{1,2})/g,
        rgb: /^rgb\(([0-9]{1,3}),\s*([0-9]{1,3}),\s*([0-9]{1,3})\)/g,
        className: function (className) {
            return new RegExp('(\\s|^)' + className + '(\\s|$)');
        },
        rect: /rect\((.*)\)/g
    };

    function RGBToHex(re) {
        if (re[0] < 0) {
            return "transparent";
        }
        var hexColor = "#";
        var hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
        for (var i = 0; i < 3; i++) {
            var r = null;
            var c = re[i];
            var hexAr = [];
            while (c > 16) {
                r = c % 16;
                c = parseInt(c / 16);
                hexAr.push(hex[r]);
            }
            hexAr.push(hex[c]);
            hexColor += hexAr.reverse().join('');
        }
        return hexColor;
    }

    function HexToRGB(hex) {
        hex = hex.trim();
        if (hex === 'transparent') {
            return [-1000, -1000, -1000];
        }
        if (hex.charAt(0) === '#') {
            var hexColor = [];
            var re = hex.replace(regexMap.color, "$1 $2 $3").split(" ");
            for (var i = 0; i < 3; i++) {
                var r = null;
                var c = re[i];
                var hexAr = [];
                for (var index = 0; index < c.length; index++) {
                    var item = c[index].toUpperCase();
                    if (item > '9') {
                        item = 10 + (item.charCodeAt(0) - 'A'.charCodeAt(0));
                    } else {
                        item = item.charCodeAt(0) - '0'.charCodeAt(0);
                    }
                    hexAr.push(item);
                }
                if (hexAr.length > 1) {
                    hexColor.push(hexAr[0] * 16 + hexAr[1]);
                } else {
                    hexColor.push(hexAr[0]);
                }
            }
            return hexColor;
        } else {
            var hexColor;

            hexColor = hex.replace(regexMap.rgb, "$1 $2 $3").split(" ");
            hexColor.each(function (index) {
                hexColor[index] = parseInt(hexColor[index]);
            });
            return hexColor;
        }
    }

    function Basic(query, context) {
        if (typeof query === 'string') {
            Sizzle(query, context, this);
        } else {
            this.push(query);
        }
    };

    Basic.extend(Array);
    Basic.method("append", function (ele) {
        var container = this[0];
        if (ele instanceof Basic) {
            ele.each(function () {
                console.log(container, this);
                container.appendChild(this);
            });
        } else {
            container.appendChild(ele);
        }
        return this;
    })
        .method("appendTo", function (selector) {
            $(selector).append(this);
        })
        .method("on", function (name, callback) {
            this.each(function () {
                facade.on(this, name, callback);
            });
            return this;
        })
        .method("once", function (name, callback) {
            this.each(function () {
                facade.once(this, name, callback);
            });
        })
        .method("hasClass", function (className) {
            return $.hasClass(this[0], className);
        })
        .method("addClass", function (className) {
            this.each(function () {
                if (!$.hasClass(this, className)) {
                    this.className += ' ' + className;
                }
            });
            return this;
        })
        .method("removeClass", function (className) {
            this.each(function () {
                this.className = this.className.replace(regexMap.className(className), " ");
            });
            return this;
        })
        .method('width', function (width) {
            if (width) {
                this.css({width: width + "px"});
                return this;
            } else {
                return parseInt(this[0].offsetWidth);
            }
        })
        .method('height', function (height) {
            if (height) {
                this.css({height: height + "px"});
                return this;
            } else {
                return parseInt(this[0].offsetHeight);
            }
        })
        .method("size", function () {
            return [parseInt(this[0].offsetWidth), parseInt(this[0].offsetHeight)];
        })
        .method("scroll", function (x, y) {
            /*
             只有window 有scrollBy 和scrollTo函数
             普通dom元素只能操作scrollTop 与scrollLeft属性
             * */
            if (arguments.length > 0) {
                var el = this[0];
                if (el === window) {
                    $.scrollTo(x, y);
                } else {
                    el.scrollLeft = x;
                    el.scrollTop = y;
                }
            } else {
                return facade.scrollPosition(this[0]);
            }
        })
        .method("position", function (absolute) {
            var x = 0, y = 0;
            if (arguments.length <= 1) {
                absolute = (absolute === undefined) ? true : false;
                if (!absolute) {

                    x = this[0].offsetLeft;
                    y = this[0].offsetTop;
                } else {

                    var el = this[0];
                    do {
                        x += el.offsetLeft;
                        y += el.offsetTop;
                        el = el.offsetParent
                    } while (el != null)
                }
                x = x || 0;
                y = y || 0;
                return [x, y];
            } else {
                x = arguments[0],
                    y = arguments[1];
                if (x !== null && y !== null) {
                    this.css({left: x + "px", top: y + "px"});
                } else if (x !== null) {
                    this.css({left: x + "px"});
                } else if (y !== null) {
                    this.css({top: y + "px"});
                }
                return this;
            }
        })
        .method("css", function (attr, value) {
            if (typeof attr === 'string') {
                return facade.css(this, attr, value);
            } else {
                for (var item in attr) {
                    facade.css(this, item, attr[item]);
                }
                return this;
            }
        })
        .method("opacity", function (value) {
            return facade.opacity(this, value);
        })
        .method("attr", function (obj) {
            if (typeof obj === 'string') {
                return this[0].getAttribute(obj);
            } else {
                for (var item in obj) {
                    this.each(function () {
                        this.setAttribute(item, obj[item]);
                    });
                }
                return this;
            }
        })
        .method("remove", function (reserve) {
            if (reserve) {
                this.each(function () {
                    var container = this.parentNode;
                    while (this.childNodes.length > 0) {
                        container.insertBefore(this.childNodes[0], this);
                    }
                    container.removeChild(this);
                });
            } else {
                this.each(function () {
                    this.parentNode.removeChild(this);
                });
            }
        })
        .method('_animate', function (key, config, emitter) {
            var $animator = animator.parser(config);
            config.step = config.step || 10;
            config.duration = config.duration || 2000;
            config.interval = config.duration / config.step;
            animator.handler.call(this, config, key, emitter, $animator, config.interval);
        })
        .method("fadeIn", function () {
            this.animate({fadeIn: {attr: 'o', from: 0, to: 1, updater: 'sin'}});
        })
        .method("fadeOut", function () {
            this.animate({fadeOut: {attr: 'o', to: 0, updater: 'sin'}});
        })
        .method("highlight", function () {
            var items = [];
            var that = this;
            this.each(function () {
                items.push({selector: this, from: 'rgb(255,255,255)', to: $(this).css("backgroundColor") || "rgb(0,0,80)", attr: 'b', updater: 'sin'});
            });
            var config = {duration: 2000, step: 20, items: items, callback: function () {
                that.css({"backgroundColor": "transparent"});
            }};
            $.animate(config);
        })
        .method("animate", function (deps) {
            var that = this;
            var emitter = new util.EventEmitter();
            emitter.animate = function (deps) {
                return that.animate(deps);
            };
            emitter.then = function (callback) {
                emitter.clear_callback = callback;
                return that;
            };
            for (var key in deps) {
                var value = deps[key];
                if (value instanceof Array) {
                    if (typeof value[value.length - 1] !== 'string') {
                        var config = value.pop();
                        emitter.all(value, function (key, config, emitter) {
                            return function () {
                                that._animate(key, config, emitter);
                            }
                        }(key, config, emitter));
                    }
                } else {
                    this._animate(key, value, emitter);
                }
            }
            return emitter;
        })
        .method('val', function (val) {
            if (val) {
                this.each(function () {
                    this.nodeValue = val;
                    this.value = val;
                });
                return this;
            } else {
                return this[0].nodeValue || this[0].value;
            }
        });
    function over(e, state, that, overCallback) {
        var curOvTime = new Date().getTime();
        state.isHover = true;//处于over状态
        if (curOvTime - state.preOvTime > 10) {//时间间隔超过10毫秒，认为鼠标完成了mouseout事件
            overCallback.call(that, e);
        }
        state.preOvTime = curOvTime;
    }

    function out(e, state, that, outCallback) {
        var curOvTime = new Date().getTime();
        state.preOvTime = curOvTime;
        state.isHover = false;
        setTimeout(function () {
            if (!state.isHover) {
                outCallback.call(that, e);
            }
        }, 10);
    }

    Basic.method('hover', function (overCallback, outCallback) {
        //现在是浏览器已经修正了，当进入子元素时，子元素的mouseover事件会触发，但是不会触发父元素的mouseout事件
        this.each(function () {
            var that = this;
            var state = {isHover: false, preOvTime: new Date().getTime()};
            $(this).on('mouseover',function (e) {
                over(e, state, that, overCallback);
            }).on('mouseout', function (e) {
                out(e, state, that, outCallback);
            });
        });
    });

    function mousemoveCheckThreshold(event, target, dest, callback, rangeEl) {
        var cursor = $.cursorPosition(event);
        if (Math.abs(target.clickOrign[0] - cursor[0]) > 3 || Math.abs(target.clickOrign[1] - cursor[1]) > 3) {
            $.off(document, "mousemove", mousemoveCheckThreshold.proxy);
            $.off(document, "mouseup", mouseupCancelThreshold.proxy);
            mouseupCancelThreshold.proxy = false;
            mousemoveCheckThreshold.proxy = false;
            var proxy;
            if (dest) {
                proxy = target[0].cloneNode(true);
               /* proxy.className = target[0].className;
                proxy.style.cssText = target[0].style.cssText;
               */
                proxy.style.position = "absolute";
                document.body.appendChild(proxy);
                proxy = $(proxy);
            } else {
                var parent = target[0].parentNode;
                target.proxyParent = parent;
                document.body.appendChild(target[0]);
                target[0].style.position = "absolute";
            }
            if ("drag" in callback) {
                callback.drag(target, proxy);
            }
            var range;
            if (rangeEl) {
                var rangeEl = $(rangeEl);
                var rangePosition = rangeEl.position();
                var rangeSize = rangeEl.size();
                range = [rangePosition[0], rangePosition[1], rangePosition[0] + rangeSize[0], rangePosition[1] + rangeSize[1]];
            }
            mousemoveDragNDrop.proxy = $.on(document, "mousemove", function (event) {
                mousemoveDragNDrop(event, dest, target, proxy, callback, range);
            });
            mouseupDragNDrop.proxy = $.on(document, "mouseup", function (event) {
                mouseupDragNDrop(event, dest, target, proxy, callback)
            });
            clickDragNDrop.proxy = $.on(document, "click", clickDragNDrop);
        }
        event.preventDefault();
    }

    function mouseupCancelThreshold() {
        $.off(document, "mousemove", mousemoveCheckThreshold.proxy);
        $.off(document, "mouseup", mouseupCancelThreshold.proxy);
        mouseupCancelThreshold.proxy = false;
        mousemoveCheckThreshold.proxy = false;
    }

    function mousemoveDragNDrop(event, dest, target, proxy, callback, range) {
        var current = $.cursorPosition(event);
        var difference = target.difference;
        if (range) {

            if (!(current[0] > range[0] && current[1] > range[1] && current[0] < range[2] && current[1] < range[3])) {
                if ("fail" in callback) {
                    callback.fail(target);
                }
                $.off(document, "mousemove", mousemoveDragNDrop.proxy);
                $.off(document, "mouseup", mouseupDragNDrop.proxy);
                document.body.removeChild(proxy[0]);
                event.preventDefault();
                return;
            }
        }
        if (dest) {
            if ("moving" in callback) {
                callback.moving(proxy, current[0] + difference[0], current[1] + difference[1], target);
            } else {
                proxy.position(current[0] + difference[0], current[1] + difference[1]);
            }
        } else {
            if ("moving" in callback) {
                callback.moving(target, current[0] + difference[0], current[1] + difference[1], target);
            } else {
                target.position(current[0] + difference[0], current[1] + difference[1]);
            }
        }

        event.preventDefault();
    }

    function mouseupDragNDrop(event, dest, target, proxy, callback) {
        if (dest) {
            if ("drop" in callback) {
                var hotZone = $(dest);
                var size = hotZone.size();
                var hotZonePosition = hotZone.position();
                var cursor = $.cursorPosition(event);
                if (((cursor[0] > hotZonePosition[0]) && (cursor[0] < hotZonePosition[0] + size[0]) && (cursor[1] > hotZonePosition[1]) && (cursor[1] < hotZonePosition[1] + size[1]))) {
                    callback['drop'](target, hotZone);
                } else {
                    if ("fail" in callback) {
                        callback.fail(target);
                    }
                }
            }
            document.body.removeChild(proxy[0]);
        }
        else {
            if ('drop' in callback) {
                callback['drop'](target);
            }
        }
        $.off(document, "mousemove", mousemoveDragNDrop.proxy);
        $.off(document, "mouseup", mouseupDragNDrop.proxy);
    }

    function clickDragNDrop(event) {
        $.off(document, "click", clickDragNDrop.proxy);
        event.preventDefault();
    }

    Basic.method("dragDrop", function (dest, callback, rangeEl) {
        this.css({cursor: 'move'}).on("mousedown", function (event) {
            var target = event.target;
            while (target.nodeType !== 1) { //一直找到元素
                target = target.parentNode;
            }
            target = $(target);
            var current = target.position();
            if (typeof target.positionOrigin === "undefined") {
                target.positionOrigin = current;  //存储对象的原始位置值，有了这个属性，即时拖拽错了，也能将对象送回原来的位置上去。
            }
            var clickOrigin = $.cursorPosition(event);
            target.clickOrign = clickOrigin;    //存储mousedown事件自身的坐标值。这些值在后面确定鼠标移动的距离时将会用到。
            target.difference = [current[0] - clickOrigin[0], current[1] - clickOrigin[1]];  //存储对象的左上角位置和mousedown事件的位置值之间的差值。
            //因为一个时刻只可能有一个元素是dragdrop的，proxy永远为false，因为这个操作本身就是串行的
            if (!mousemoveCheckThreshold.proxy) {
                mousemoveCheckThreshold.proxy = $.on(document, "mousemove", function (event) {
                    mousemoveCheckThreshold(event, target, dest, callback, rangeEl);
                });
                mouseupCancelThreshold.proxy = $.on(document, "mouseup", mouseupCancelThreshold);
            }
            event.preventDefault();
        });
    });

    var $ = function (query, context) {
        return new Basic(query, context);
    };
    $.isFunction = function (fun) {
        if (typeof fun === 'function') {
            return true;
        } else {
            return false;
        }
    };
    $.isArray = function (array) {
        if (array instanceof Array) {
            return true;
        } else {
            return false;
        }
    };
    $.isString = function (str) {
        if (typeof str === 'string') {
            return true;
        } else {
            return false;
        }
    };
    $.registed = function (domain) {
        var domains = domain.split("."),
            scope = window,
            space;
        while (space = domains.shift()) {
            if (!(space in scope)) {
                return false;
            } else {
                scope = scope[space];
            }
        }
        return true;
    }
    $.fixEvent = function (event) {
        if (!event) {
            event = window.event;
            console.log("fixEvent");
            event.preventDefault = $.fixEvent.preventDefault;
            event.stopPropagation = $.fixEvent.stopPropagation;
            event.target = event.srcElement;
            event.relatedTarget = event.toElement || event.fromElement;//mouseout mouseover
        }
        return event;
    };
    $.fixEvent.preventDefault = function () {
        this.returnValue = false;
    };
    $.fixEvent.stopPropagation = function () {
        this.cancelBubble = true;
    };
    $.animate = function (config) {
        config.duration = config.duration || 2000;
        config.step = config.step || 10;
        config.interval = config.duration / config.step;

        config.items.each(function () {
            this.duration = config.duration;
            this.step = config.step;

            this.base = $(this.selector);
            this.$animator = animator.parser(this);
        });
        animator.$handler(config);
    }
    $.on = function (selector, eventName, handler) {
        var base = $(selector);
        return facade.on(base[0], eventName, handler);
    }
    $.off = function (selector, eventName, handler) {
        var base = $(selector);
        facade.off(base[0], eventName, handler);
    }
    $.hasClass = function (dom, className) {
        return dom.className.match(regexMap.className(className));
    }
    $.ready = function () {
        var handler = [];
        facade.domContentLoaded(handler);
        return function (fn) {
            handler.push(fn);
        }
    }();
    /*
     只有window 有scrollBy 和scrollTo函数
     普通dom元素只能操作scrollTop 与scrollLeft属性
     * */
    $.scrollBy = function (x, y) {
        window.scrollBy(x, y);
    }
    $.scrollTo = function (x, y) {
        window.scrollTo(x, y);
    };
    /*获得视口大小*/
    $.viewportSize = function () {
        return facade.viewportSize();
    }
    $.cursorPosition = function (event) {
        return facade.cursorPosition(event);
    }

    //创建cookie
    $.setCookie = function (name, value, expires, path, domain, secure) {
        var cookieText = encodeURIComponent(name) + '=' + encodeURIComponent(value);
        if (expires instanceof Date) {
            cookieText += '; expires=' + expires;
        }
        if (path) {
            cookieText += '; expires=' + expires;
        }
        if (domain) {
            cookieText += '; domain=' + domain;
        }
        if (secure) {
            cookieText += '; secure';
        }
        document.cookie = cookieText;
    }

    //获取cookie
    $.getCookie = function (name) {
        var cookieName = encodeURIComponent(name) + '=';
        var cookieStart = document.cookie.indexOf(cookieName);
        var cookieValue = null;
        if (cookieStart > -1) {
            var cookieEnd = document.cookie.indexOf(';', cookieStart);
            if (cookieEnd == -1) {
                cookieEnd = document.cookie.length;
            }
            cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd));
        }
        return cookieValue;
    }

    //删除cookie
    $.unsetCookie = function (name) {
        document.cookie = name + "= ; expires=" + new Date(0);
    }

    $.onTip = function (className) {
        $("." + className).on("mouseover", function (event) {
            var target = event.target;
            while (target.className === null || !$.hasClass(target, className)) {
                target = target.parentNode;
            }
            var tip = document.createElement("div");
            var content = target.getAttribute("title");
            //target.setAttribute("tooltip",tip); setAttribute只能设置基本类型，非基本类型则转化为字符串
            target.tooltip = tip;//可以设置非基本类型，但是兼容性不好

            tip.className = "tooltip";
            tip.appendChild(document.createTextNode(content));
            var cursorPosition = $.cursorPosition(event);
            tip.style.position = "absolute";
            tip.style.left = (cursorPosition[0] + 10) + "px";
            tip.style.top = (cursorPosition[1] + 10) + "px";
            document.body.appendChild(tip);
        })
            .on("mouseout", function (event) {
                var target = event.target;
                var tooltip = target.tooltip;
                if (tooltip !== null) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            });
    }
    $.create = function (className, config) {
        var domains = className.split(".");
        var domain, scope = window;
        while ((domain = domains.shift())) {
            scope = scope[domain];
        }
        return new scope(config);
    }
    $.applyIf = function (config, ref) {
        config = config || config;
        for (var item in ref) {
            if (!(item in config)) {
                config[item] = ref[item];
            }
        }
        return config;
    }
    window.$ = $;
})(window);








