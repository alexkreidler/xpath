import { NodeXPathNSResolver } from './node-x-path-ns-resolver';
import { isNSResolver } from './utils/types';
import { XPathException } from './xpath-exception';
import { XPathExpressionImpl } from './xpath-expression-impl';
import { XPathNSResolverWrapper } from './xpath-ns-resolver-wrapper';
import { XPathParser } from './xpath-parser';
import { XPathResultImpl } from './xpath-result-impl';
import { FunctionResolver, VariableResolver } from './xpath-types';

export function select(e: string, doc?: Node, single: boolean = false) {
  return selectWithResolver(e, doc, null, single);
}

export function useNamespaces(mappings: { [key: string]: string | null }) {
  const resolver = {
    mappings: mappings || {},
    lookupNamespaceURI(prefix: string) {
      return this.mappings[prefix] !== undefined ? this.mappings[prefix] : null;
    }
  };

  return (e: string, doc: Node, single: boolean = false) => {
    return selectWithResolver(e, doc, resolver, single);
  };
}

export function evaluate(
  expression: string,
  contextNode?: Node,
  resolver?: XPathNSResolver | ((prefix: string) => string | null) | null,
  type: number = 0,
  result?: XPathResult | null
) {
  if (type < 0 || type > 9) {
    throw {
      code: 0,
      toString() {
        return 'Request type not supported';
      }
    };
  }

  resolver = convertNSResolver(resolver);
  const ex = new XPathExpressionImpl(expression, { nr: new XPathNSResolverWrapper(resolver) });
  return ex.evaluate(contextNode, type, result === undefined ? null : result);
}

export function selectWithResolver(
  e: string,
  doc: Node | undefined,
  resolver: XPathNSResolver | null,
  single: boolean = false
) {
  const expression = new XPathExpressionImpl(e, { nr: new XPathNSResolverWrapper(resolver) });
  const type = XPathResultImpl.ANY_TYPE;

  const evalResult = expression.evaluate(doc, type, null);
  let result: string | number | boolean | Node | Node[];

  if (evalResult.resultType === XPathResultImpl.STRING_TYPE) {
    result = evalResult.stringValue;
  } else if (evalResult.resultType === XPathResultImpl.NUMBER_TYPE) {
    result = evalResult.numberValue;
  } else if (evalResult.resultType === XPathResultImpl.BOOLEAN_TYPE) {
    result = evalResult.booleanValue;
  } else {
    result = evalResult.nodes;
    if (single) {
      result = result[0];
    }
  }

  return result;
}

export function select1(e: string, doc?: Node) {
  return select(e, doc, true);
}

export function installXPathSupport(
  doc: Document,
  { fr, vr, p }: { fr?: FunctionResolver; vr?: VariableResolver; p?: XPathParser }
): Document & XPathEvaluator {
  const evaluator = (doc as unknown) as XPathEvaluator;

  evaluator.createExpression = (e: string, r: XPathNSResolver | null) => {
    try {
      return new XPathExpressionImpl(e, { fr, nr: new XPathNSResolverWrapper(r), vr, p });
    } catch (e) {
      throw new XPathException(XPathException.INVALID_EXPRESSION_ERR, e);
    }
  };
  evaluator.createNSResolver = (n: Node) => {
    return new NodeXPathNSResolver(n);
  };
  evaluator.evaluate = (expression, cn, resolver, type, res) => {
    if (type < 0 || type > 9) {
      throw {
        code: 0,
        toString() {
          return 'Request type not supported';
        }
      };
    }

    resolver = convertNSResolver(resolver);

    const ex = evaluator.createExpression(expression, resolver);
    return ex.evaluate(cn, type, res);
  };

  return (doc as unknown) as Document & XPathEvaluator;
}

function convertNSResolver(resolver: XPathNSResolver | ((prefix: string) => string | null) | null | undefined) {
  if (resolver == null) {
    return {
      lookupNamespaceURI(_prefix: string): null {
        return null;
      }
    };
  } else if (!isNSResolver(resolver)) {
    const pr = resolver;
    return {
      lookupNamespaceURI(prefix: string): string | null {
        return pr(prefix);
      }
    };
  } else {
    return resolver;
  }
}
