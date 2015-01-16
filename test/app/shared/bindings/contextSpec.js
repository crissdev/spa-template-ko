define(['knockout', 'app/shared/bindings/context'], function(ko, contextBinding) {
    'use strict';

    describe('context binding', function() {
        beforeEach(function() {
            ko.bindingHandlers.context = contextBinding;
        });

        it('should not accept empty alias', function() {
            var element = document.createElement('div');
            element.setAttribute('data-bind', 'context: $data');
            expect(function() { ko.applyBindings({}, element); }).toThrow();

            element = document.createElement('div');
            element.setAttribute('data-bind', 'context: {data: $data, as: \'\'}');
            expect(function() { ko.applyBindings({}, element); }).toThrow();

            element = document.createElement('div');
            element.setAttribute('data-bind', 'context: {data: $data, as: null}');
            expect(function() { ko.applyBindings({}, element); }).toThrow();
        });

        it('should define the alias in the binding context', function() {
            var element = document.createElement('div');
            element.setAttribute('data-bind', 'context: {data: info, as:\'p\'}');
            element.insertAdjacentHTML('afterbegin', '<span data-bind="text: p.version"></span>');
            element.insertAdjacentHTML('beforeend', '<p data-bind="text: $parent.name"></span>');

            var viewModel = {
                name: 'knockout',
                info: {
                    version: '3.2.0'
                }
            };

            ko.applyBindings(viewModel, element);

            expect(ko.contextFor(element.querySelector('span')).p).toBeDefined();
            expect(element.querySelector('span').innerText).toBe('3.2.0');
            expect(element.querySelector('p').innerText).toBe('knockout');
        });

        it('should use the current data', function() {
            var element = document.createElement('div');
            element.setAttribute('data-bind', 'context: {as:\'p\'}');
            element.insertAdjacentHTML('afterbegin', '<span data-bind="text: p.info.version"></span>');
            element.insertAdjacentHTML('beforeend', '<p data-bind="text: $parent.name"></span>');

            var viewModel = {
                name: 'knockout',
                info: {
                    version: '3.2.0'
                }
            };

            ko.applyBindings(viewModel, element);

            expect(ko.contextFor(element.querySelector('span')).p).toBeDefined();
            expect(element.querySelector('span').innerText).toBe('3.2.0');
            expect(element.querySelector('p').innerText).toBe('knockout');
        });
    });
});

