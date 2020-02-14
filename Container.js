class Container {

    constructor() {
        this._services = new Map();
        this._singletons = new Map();
    }

    register(name, definition, dependencies) {
		const dependenciesArray = dependencies ? dependencies : [];
        this._services.set(name, {name: name, definition: definition, dependencies: dependenciesArray});
    }

    singleton(name, definition, dependencies) {
		const dependenciesArray = dependencies ? dependencies : [];
        this._services.set(name, {name: name, definition: definition, dependencies: dependenciesArray, singleton:true});
    }

    get(name) {
        const c = this._services.get(name);

        if(this._isClass(c.definition)) {

            if(c.singleton) {
                const singletonInstance = this._singletons.get(name);
                if(singletonInstance) {
                    return singletonInstance;
                } else {
                    const newSingletonInstance = this._createInstance(c);
                    this._singletons.set(name, newSingletonInstance);
                    return newSingletonInstance;
                }
            }

            return this._createInstance(c);

        } else {
            return c.definition;
        }
    }

    _getResolvedDependencies(service) {
        let classDependencies = [];
        if(service.dependencies) {
            classDependencies = service.dependencies.map((dep) => {
				if (this._services.get(dep).dependencies.indexOf(service.name) !== -1) {
					throw 'There is a circular dependency';
				}
                return this.get(dep);
            })
        }
        return classDependencies;
    }

    _createInstance(service) {
		try {
			const dependencies = this._getResolvedDependencies(service);
			return new service.definition(...dependencies);
		} catch(e) {
			throw e;
		}
    }

    _isClass(definition) {
        return typeof definition === 'function';
    }
}
export default Container
