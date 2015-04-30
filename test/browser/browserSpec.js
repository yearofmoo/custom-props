var expect = chai.expect;

describe("CustomProps", function() {

  var ss, sinonEnv;
  afterEach(function() {
    CustomProps.flush();
    document.body.innerHTML = '';
    sinonEnv.restore();
    if (ss) {
      ss.destroy();
    }
  });

  var element;
  beforeEach(function() {
    sinonEnv = sinon.sandbox.create();
    ss = createMockStyleSheet();
    element = document.createElement('div');
    element.classList.add('element');
    document.body.appendChild(element);
  });

  it("should detect custom properties", function() {
    ss.addRule('.element',
      createCustomProps({
        '--prop':'value'
      })
    );
    expect(CustomProps.read(element, 'prop')).to.equal('value');
  });

  it("should detect custom properties and consider them as strings", function() {
    ss.addRule('.element',
      createCustomProps({
        '--prop':500
      })
    );
    expect(CustomProps.read(element, 'prop')).to.equal('500');
  });

  it("should return all the styles in an object", function() {
    ss.addRule('.element',
      createCustomProps({
        '--one':'one',
        '--two':2,
        '--three':'three 3',
      })
    );

    expect(CustomProps.data(element)).to.eql({
      one: 'one',
      two: '2',
      three: 'three 3',
    });
  });

  describe('caching', function() {

    var count;

    beforeEach(function() {
      count = 0;
      sinonEnv.stub(window, 'getComputedStyle', function() {
        count++;
        return { content: '' };
      });
    });

    function touchAndAssertCount(element, value) {
      CustomProps.data(element);
      expect(count).to.equal(value);
    }

    it("should cache repeated calls to getComputedStyle on the same element", function() {
      if (element.currentStyle) return;

      ss.addRule('.element',
        createCustomProps({
          '--prop':'val',
        })
      );

      touchAndAssertCount(element, 1);
      touchAndAssertCount(element, 1);
    });

    it("should only cache repeated calls unless the class value of the element changes", function() {
      if (element.currentStyle) return;

      ss.addRule('.element',
        createCustomProps({
          '--prop':'val',
        })
      );

      touchAndAssertCount(element, 1);

      element.classList.add('another-class');

      touchAndAssertCount(element, 2);

      element.classList.remove('another-class');

      touchAndAssertCount(element, 2);
    });

    it("should only cache repeated calls unless the element is moved around in the DOM", function() {
      if (element.currentStyle) return;

      ss.addRule('.element',
        createCustomProps({
          '--prop':'val',
        })
      );

      touchAndAssertCount(element, 1);

      var newSibling = document.createElement('div');
      document.body.insertBefore(newSibling, element);

      touchAndAssertCount(element, 2);

      document.body.removeChild(newSibling);

      touchAndAssertCount(element, 2);
    });

    it("should only cache repeated calls unless the element is moved into another DOM element", function() {
      if (element.currentStyle) return;

      ss.addRule('.element',
        createCustomProps({
          '--prop':'val',
        })
      );

      touchAndAssertCount(element, 1);

      var newParent = document.createElement('div');
      document.body.appendChild(newParent);
      newParent.appendChild(element);

      touchAndAssertCount(element, 2);

      document.body.appendChild(element);
      document.body.removeChild(newParent);

      touchAndAssertCount(element, 2);
    });

    describe('.flush()', function() {
      it("should flush the entire cache for all elements and their states", function() {
        var element2 = document.createElement('div');
        element2.classList.add('element2');
        document.body.appendChild(element2);

        ss.addRule('.element',
          createCustomProps({ '--prop':'val', })
        );

        ss.addRule('.element2',
          createCustomProps({ '--prop':'val', })
        );

        touchAndAssertCount(element, 1);
        touchAndAssertCount(element, 1);

        touchAndAssertCount(element2, 2);
        touchAndAssertCount(element2, 2);

        CustomProps.flush();

        touchAndAssertCount(element, 3);
        touchAndAssertCount(element, 3);

        touchAndAssertCount(element2, 4);
        touchAndAssertCount(element2, 4);
      });
    });

    describe('.flush(element)', function() {
      it("should flush the cache on the given element for all cached states", function() {
        if (element.currentStyle) return;

        ss.addRule('.element',
          createCustomProps({
            '--prop':'val',
          })
        );

        touchAndAssertCount(element, 1);
        touchAndAssertCount(element, 1);

        element.classList.add('another-state');

        touchAndAssertCount(element, 2);
        touchAndAssertCount(element, 2);

        CustomProps.flush(element);

        touchAndAssertCount(element, 3);
        touchAndAssertCount(element, 3);

        element.classList.remove('another-state');

        touchAndAssertCount(element, 4);
        touchAndAssertCount(element, 4);
      });
    });
  });
});
