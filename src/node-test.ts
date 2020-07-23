import { XPathNamespace } from './xpath-namespace';
import { XPathContext } from './xpath-types';

// tslint:disable:member-ordering

export enum NodeTestType {
  NameTestAny,
  NameTestPrefixAny,
  NameTestQName,
  Comment,
  Text,
  ProcessingInstruction,
  Node
}

export class NodeTest {
  static isNodeType(types: NodeTestType[]) {
    return (n: Node) => {
      return types.includes(n.nodeType) || ((n as Attr).specified && types.includes(2)); // DOM4 support
    };
  }

  // create invariant node test for certain node types
  static makeNodeTypeTest(type: NodeTestType, nodeTypes: NodeTestType[], stringVal: string): NodeTest {
    return new (class extends NodeTest {
      constructor() {
        super(type);
      }

      matches = NodeTest.isNodeType(nodeTypes);
      toString = () => stringVal;
    })();
  }

  static hasPrefix(node: Node) {
    return (node as any).prefix || (node.nodeName || (node as any).tagName).indexOf(':') !== -1;
  }

  static isElementOrAttribute = NodeTest.isNodeType([1, 2]);

  static nameSpaceMatches(prefix: string | null, xpc: XPathContext, n: Node) {
    const nNamespace = n.namespaceURI || '';

    if (!prefix) {
      return !nNamespace || (xpc.allowAnyNamespaceForNoPrefix && !NodeTest.hasPrefix(n));
    }

    const ns = xpc.namespaceResolver.getNamespace(prefix, n);

    if (ns == null) {
      // throw new Error('Cannot resolve QName ' + prefix);
      return false;
    }

    return ns === nNamespace;
  }

  static localNameMatches = (localName: string, xpc: XPathContext, n: Node) => {
    const nLocalName = (n as Element).localName || n.nodeName;

    return xpc.caseInsensitive ? localName.toLowerCase() === nLocalName.toLowerCase() : localName === nLocalName;
    // tslint:disable-next-line:semicolon
  };

  // tslint:disable-next-line:variable-name
  static NameTestPrefixAny = class extends NodeTest {
    prefix: string;

    constructor(prefix: string) {
      super(NodeTestType.NameTestPrefixAny);

      this.prefix = prefix;
    }

    matches(n: Node, xpc: XPathContext) {
      return NodeTest.isElementOrAttribute(n) && NodeTest.nameSpaceMatches(this.prefix, xpc, n);
    }

    toString() {
      return this.prefix + ':*';
    }
  };

  // tslint:disable-next-line:variable-name
  static NameTestQName = class extends NodeTest {
    name: string;
    prefix: string | null;
    localName: string;

    constructor(name: string) {
      super(NodeTestType.NameTestQName);

      const nameParts = name.split(':');

      this.name = name;
      this.prefix = nameParts.length > 1 ? nameParts[0] : null;
      this.localName = nameParts[nameParts.length > 1 ? 1 : 0];
    }

    matches(n: Node, xpc: XPathContext) {
      return (
        NodeTest.isNodeType([1, 2, XPathNamespace.XPATH_NAMESPACE_NODE])(n) &&
        NodeTest.nameSpaceMatches(this.prefix, xpc, n) &&
        NodeTest.localNameMatches(this.localName, xpc, n)
      );
    }
    toString() {
      return this.name;
    }
  };

  // tslint:disable-next-line:variable-name
  static PITest = class extends NodeTest {
    name: string;

    constructor(name: string) {
      super(NodeTestType.ProcessingInstruction);

      this.name = name;
    }

    matches(n: Node, _xpc: XPathContext) {
      return NodeTest.isNodeType([7])(n) && ((n as ProcessingInstruction).target || n.nodeName) === this.name;
    }

    toString() {
      return `processing-instruction("${this.name}")`;
    }
  };

  // elements, attributes, namespaces
  static nameTestAny = NodeTest.makeNodeTypeTest(
    NodeTestType.NameTestAny,
    [1, 2, XPathNamespace.XPATH_NAMESPACE_NODE],
    '*'
  );
  // text, cdata
  static textTest = NodeTest.makeNodeTypeTest(NodeTestType.Text, [3, 4], 'text()');
  static commentTest = NodeTest.makeNodeTypeTest(NodeTestType.Comment, [8], 'comment()');
  // elements, attributes, text, cdata, PIs, comments, document nodes
  static nodeTest = NodeTest.makeNodeTypeTest(NodeTestType.Node, [1, 2, 3, 4, 7, 8, 9], 'node()');
  static anyPiTest = NodeTest.makeNodeTypeTest(NodeTestType.ProcessingInstruction, [7], 'processing-instruction()');

  type: NodeTestType;

  constructor(type: NodeTestType) {
    this.type = type;
  }

  toString(): string {
    return '<unknown nodetest type>';
  }

  matches(_n: Node, _xpc: XPathContext): boolean {
    // tslint:disable-next-line:no-console
    console.warn('unknown node test type');
    return false;
  }
}
