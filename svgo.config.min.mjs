var prefixId = 0
export default {
  multipass: true,
  eol: 'lf',
  plugins: [
    'cleanupAttrs',
    'inlineStyles',
    'removeXlink',
    'removeDoctype',
    'removeXMLProcInst',
    'removeComments',
    'removeMetadata',
    'removeDesc',
    'removeUselessDefs',
    'removeEditorsNSData',
    'removeEmptyAttrs',
    'removeHiddenElems',
    'removeEmptyText',
    'removeEmptyContainers',
    'cleanupEnableBackground',
    'removeUnusedNS',
    'cleanupNumericValues',
    'cleanupListOfValues',
    'moveGroupAttrsToElems',
    'collapseGroups',
    {
      // Sort the attributes on the <svg> tag
      name: 'sortAttrs',
      params: {
        order: ['role', 'viewBox'],
        xmlnsOrder: 'end',
      },
    },
    'sortDefsChildren',
    // 'removeDimensions',
    'removeElementsByAttr',
    {
      // Keep the role="img" attribute and automatically add it
      // to the <svg> tag if it's not there already
      name: 'addAttributesToSVGElement',
      params: {
        attributes: [{ role: 'img', xmlns: 'http://www.w3.org/2000/svg' }],
      },
    },
    'removeOffCanvasPaths',
    {
      name: "addAttributesToSVGElement",
      params: {
        attributes: [{
          width: "32",
          height: "32",
        }]
      },
    },
    {
      name: 'prefixIds',
      params: {
        prefix: function (node, b) {
          console.log(node.attributes.id, b.path)
          if (node.attributes.id !== undefined && node.attributes.id.indexOf(b.path) == -1) {
            return b.path + prefixId++
          }
          else {
            return prefixId++
          }
        }
      }
    },
    // 'reusePaths',
  ],
};
