const parent = i => ((i + 1) >>> 1) - 1;
const left = i => (i << 1) + 1;
const right = i => (i + 1) << 1;

class Node{
    constructor(value, info){
        this.value = value;
        this.info = info;
        this.i = null;
    }
}


class PriorityQueue {
    constructor(comparator = (a, b) => a > b) {
        this._heap = [];
        this._comparator = comparator;
    }
    size() {
        return this._heap.length;
    }
    isEmpty() {
        return this.size() == 0;
    }
    peek() {
        return this._heap[0];
    }
    push(node) {
        node.i = this._heap.length;
        this._heap.push(node);
        this._siftUp(this.size()-1);
    }
    pop() {
        const poppedValue = this.peek();
        const bottom = this.size() - 1;
        if (bottom > 0) {
            this._swap(0, bottom);
        }
        this._heap.pop();
        this._siftDown(0);
        return poppedValue;
    }
    changeValue(node, new_value){
        node.value = new_value;
        let i = node.i;
        this._siftDown(i);
        this._siftUp(i);
    }

    remove(node){
        let i = node.i;
        const bottom = this.size() - 1;
        if (i == bottom) {
            this._heap.pop();
        }
        else{
            this._swap(i, bottom);
            this._heap.pop();
            this._shiftUp(i);
            this._shiftDown(i);
        }
    }

    _greater(i, j) {
        return this._comparator(this._heap[i], this._heap[j]);
    }
    _swap(i, j) {
        [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
        this._heap[i].i = i;
        this._heap[j].i = j;
    }
    _siftUp(i) {
        while (i > 0 && this._greater(parent(i), i)) {
            this._swap(i, parent(i));
            i = parent(i);
        }
    }
    _siftDown(i) {
        while (
            (left(i) < this.size() && this._greater(i, left(i))) ||
            (right(i) < this.size() && this._greater(i, right(i)))
        ) {
            let maxChild = (right(i) < this.size() && this._greater(left(i), right(i))) ? right(i) : left(i);
            this._swap(i, maxChild);
            i = maxChild;
        }
    }
}