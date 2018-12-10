export class XPathNSResolverWrapper {
  xpathNSResolver: XPathNSResolver | null;

  constructor(r: XPathNSResolver | null) {
    this.xpathNSResolver = r;
  }

  getNamespace(prefix: string, _n: Node) {
    if (this.xpathNSResolver == null) {
      return null;
    }
    return this.xpathNSResolver.lookupNamespaceURI(prefix);
  }
}
