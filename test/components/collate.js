describe('collate', function() {
  it('should collate based on a single field', function(){
    var result = [];

    var sender0  = fbp.defProc(MockSender(['1,m1','2,m2','3,m3']));
    var sender1  = fbp.defProc(MockSender(['1,d11','1,d12','2,d21','3,d31','3,d32','3,d33','4,d41']));
    var collate  = fbp.defProc('./components/collate.js');
    var receiver = fbp.defProc(MockReceiver(result));

    fbp.initialize(collate, 'CTLFIELDS', '1');
    fbp.connect(sender0, 'OUT', collate, 'IN[0]', 5);
    fbp.connect(sender1, 'OUT', collate, 'IN[1]', 5);
    fbp.connect(collate, 'OUT', receiver, 'IN');

    fbp.run({ trace: false });

    expect(result).to.deep.equal(['1,m1', '1,d11', '1,d12', '2,m2', '2,d21', '3,m3', '3,d31', '3,d32', '3,d33', '4,d41']);
  });
});
